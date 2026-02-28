import axios from "axios";
import https from "https";
import Tender from "../models/Tender";
import pLimit from "p-limit";
import { generateTenderIds } from "../controllers/tender.controller";

const BASE_URL = "https://eproc2.bihar.gov.in/EPSV2Web";

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

const client = axios.create({
    httpsAgent,
    timeout: 15000,
});

const limit = pLimit(5);

function getTemplateField(detail: any, shortName: string, code: string): string | null {
    const template = (detail.templates || []).find((t: any) => t.shortName === shortName);
    return template?.templateFieldList?.find((f: any) => f.code === code)?.value ?? null;
}

function buildDateRawFormatted(epochStr: string | null | number): {
    raw: string;
    formatted: string;
    asDate: Date | null;
} {
    if (!epochStr) return { raw: "", formatted: "", asDate: null };
    const ms = typeof epochStr === "number" ? epochStr : parseInt(epochStr, 10);
    if (isNaN(ms)) return { raw: String(epochStr), formatted: "", asDate: null };
    const date = new Date(ms);
    return {
        raw: String(epochStr),
        formatted: date.toISOString(),
        asDate: date,
    };
}

async function mapGovTenderToApp(detail: any) {
    // ── Date Schedule ──────────────────────────────────────────────
    const bidStart = getTemplateField(detail, "rfqdate", "bid_start_date");
    const bidEnd = getTemplateField(detail, "rfqdate", "bid_end_date");
    const bidOpen = getTemplateField(detail, "rfqdate", "bid_open_date");
    const docSub = getTemplateField(detail, "rfqdate", "doc_sub_date");

    // ── Pre-Bid Discussion ─────────────────────────────────────────
    const discussionType = getTemplateField(detail, "prebiddiscussion", "discussion_type");
    const meetingStart = getTemplateField(detail, "prebiddiscussion", "meeting_start_date");
    const meetingEnd = getTemplateField(detail, "prebiddiscussion", "meeting_end_date");
    const venue = getTemplateField(detail, "prebiddiscussion", "venue");
    const remarks = getTemplateField(detail, "prebiddiscussion", "remarks");

    // ── Payments (one row per rfqpayment template) ─────────────────
    const payments = (detail.templates || [])
        .filter((t: any) => t.shortName === "rfqpayment")
        .map((template: any) => {
            const get = (code: string) =>
                template.templateFieldList?.find((f: any) => f.code === code)?.value ?? null;
            return {
                paymentType: get("payment_type"),
                amount: Number(get("amount") || 0),
                paymentMode: get("payment_mode"),
                paymentCurrency: get("payment_currency"),
                exemptionAllowed: get("exemption_flag"),
                exemptionReason: get("supporting_doc"),
            };
        });

    // ── General Particulars ────────────────────────────────────────
    // Each general_particulars_rh template has a single field whose
    // value IS the label (e.g. "NAME OF THE BIDDER"). The bidder
    // fills it in later, so we store it as a label/prompt.
    const generalParticulars = (detail.templates || [])
        .filter((t: any) => t.shortName === "general_particulars_rh")
        .map((template: any) => ({
            label: template.templateFieldList?.[0]?.value || "",
            value: "",   // to be filled by bidder
        }));

    // ── Terms & Conditions ─────────────────────────────────────────
    // Group rows by indexSerialNo: each br_rfq_technical template = one clause
    const termsAndConditions = (detail.templates || [])
        .filter((t: any) => t.shortName === "br_rfq_technical")
        .map((template: any) => {
            const get = (code: string) =>
                template.templateFieldList?.find((f: any) => f.code === code)?.value ?? "";
            const attachRaw = get("unf3"); // e.g. "31473/1770125952445_Tendor Motihari_03.02.2026.pdf|Tendor Motihari_03.02.2026.pdf"
            return {
                clauseNo: get("unf1"),
                specification: get("unf2"),
                attachment: attachRaw,
            };
        });

    // ── Tender Attachments (rfqattachment) ─────────────────────────
    const attachments = (detail.templates || [])
        .filter((t: any) => t.shortName === "rfqattachment")
        .map((template: any) => {
            const get = (code: string) =>
                template.templateFieldList?.find((f: any) => f.code === code)?.value ?? "";
            const fileRaw = get("attach_file");
            // format: "31476/1770126044964_tech sheet motihari.xlsx|11772|tech sheet motihari.xlsx"
            const parts = fileRaw.split("|");
            const filePath = parts[0] || "";
            const fileName = get("file_name");
            const downloadUrl = filePath
                ? `${BASE_URL}/downloadDocument/${filePath}`
                : "";
            return {
                label: get("label"),
                fileName,
                filePath,
                downloadUrl,
            };
        });

    // ── Required Bidder Attachments ────────────────────────────────
    const requiredAttachments = (detail.templates || [])
        .filter((t: any) => t.shortName === "requiredbidderattachment")
        .map((template: any) => {
            const get = (code: string) =>
                template.templateFieldList?.find((f: any) => f.code === code)?.value ?? "";
            return {
                supportingDocument: get("supporting_doc"),
                mandatory: get("mandatory_flag"),
                allowExemption: get("exemption_flag"),
                group: get("attachment_group"),
                evaluationType: get("evaluation_type"),
            };
        });

    // ── BOQ Items ──────────────────────────────────────────────────
    const boq = (detail.templates || [])
        .filter((t: any) => t.shortName === "boq_lump_sum_rate")
        .map((template: any) => {
            const get = (code: string) =>
                template.templateFieldList?.find((f: any) => f.code === code)?.value ?? "";
            const boqAttachRaw = get("unf1");
            // format: "31481/1770126143185_motihari khand k.xlsx|motihari khand k.xlsx"
            const boqParts = boqAttachRaw.split("|");
            const boqFilePath = boqParts[0] || "";
            const boqFileName = boqParts[1] || "";
            return {
                itemCode: get("item_code"),
                itemName: get("item_name"),
                uom: get("uom"),
                quantity: Number(get("item_qty") || 0),
                estimatedCost: Number(get("sor_rate") || 0),
                sorTotal: get("estimat_price"),
                attachment: boqFilePath
                    ? {
                        label: "BOQ",
                        fileName: boqFileName,
                        filePath: boqFilePath,
                        downloadUrl: `${BASE_URL}/downloadDocument/${boqFilePath}`,
                    }
                    : null,
                mandatoryItem: get("mandatory_item"),
            };
        });

    // ── Authority helpers ──────────────────────────────────────────
    const mapAuthority = (auth: any) => {
        if (!auth) return {};
        return {
            tenderIssuingAuthorityId: auth.tenderIssuingAuthorityId,
            tenderIssuingAuthorityName: auth.tenderIssuingAuthorityName,
            tenderIssuingAuthorityDesignation: auth.tenderIssuingAuthorityDesignation,
            organizationName: auth.organizationName,
            organizationCode: auth.organizationCode,
            address: auth.address,
            email: auth.email,
            contactNo: auth.contactNo,
            identifystring: auth.identifystring,
            parentId: auth.parentId,
            createid: auth.createid,
            createdate: auth.createdate,
            updateid: auth.updateid,
            updatedate: auth.updatedate,
            isActive: auth.isActive,
            orgHirarchy: auth.orgHirarchy || {},
        };
    };

    // ── Category from tenderPreviewMap ─────────────────────────────
    const cat = detail.tenderPreviewMap?.catagory;
    const category = cat
        ? {
            label: cat.rfqcategoryId,
            categoryDescription: cat.categoryDescription,
            bidPartList: cat.bidPartList,
            maxAssociateBidpart: cat.maxAssociateBidpart,
        }
        : undefined;

    // ── Org hierarchy & dealing officer ───────────────────────────
    const creatorDetail = detail.tenderPreviewMap?.creatorDetail;
    const orgHierarchy = creatorDetail?.OrgHirarchy
        ? Object.values(creatorDetail.OrgHirarchy) as string[]
        : [];
    const tenderCreator = creatorDetail?.DealingOfficer || "";


    const { slug } = await generateTenderIds(detail?.nit);

    // ── Final mapped object ────────────────────────────────────────
    return {
        generalInformation: {
            bidParts: detail.bidPartNo,
            category,
            tenderCreator,
            organizationHierarchy: orgHierarchy,
            systemTenderNo: detail.tenderid?.toString(),
            tenderReferenceNo: detail.tenderrefno,
            tenderTitle: detail.nit,
            procurementCategory: detail.tenderPreviewMap?.procCat || detail.proccatid?.toString(),
            tenderCurrency: detail.tendercurrency,
            biddingCurrency: detail.bidcurrency,
            tenderType: detail.tenderPreviewMap?.tenderType || detail.tendertypeid?.toString(),
            estimatedValueVisibilityFlag: detail.pacVisibilityFlag,
            minimumNumberOfBids: detail.minbidno,
            rankingSequence: detail.rankingsequence,
            offerValidityInDays: detail.offerValidity,
            tenderIssuingAuthorityName: detail.tenderIssuingAuthority?.tenderIssuingAuthorityName || "",
            tenderApprovingAuthorityName: detail.tenderApprovingAuthority?.tenderApprovingAuthorityName || "",
            detailedDescription: detail.description,
            NIT: detail.nit,
            createdate: detail.createdate,
            createdOn: buildDateRawFormatted(detail.createdate),
        },

        dateSchedule: {
            bidSubmissionStartDate: buildDateRawFormatted(bidStart),
            bidSubmissionDueDate: buildDateRawFormatted(bidEnd),
            bidOpenDate: buildDateRawFormatted(bidOpen),
            physicalDocSubmissionEndDate: buildDateRawFormatted(docSub),
        },

        preBidDiscussion: {
            discussionType,
            meetingStartDate: buildDateRawFormatted(meetingStart),
            meetingEndDate: buildDateRawFormatted(meetingEnd),
            venue,
            remarks,
        },

        payments,
        generalParticulars,
        termsAndConditions,
        attachments,
        requiredAttachments,
        boq,

        tenderIssuingAuthority: mapAuthority(detail.tenderIssuingAuthority),
        tenderApprovingAuthority: mapAuthority(detail.tenderApprovingAuthority),

        meta: {
            source: "Bihar Eproc",
            sourceUrl: `${BASE_URL}/openarea/tenderListingPage.action`,
            createdOn: buildDateRawFormatted(detail.createdate),
        },

        tenderId: detail.tenderid?.toString(),
        externalSystemDisplayTenderId: detail.orgtenderid?.toString(),
        slug: slug,
        status: "PUBLISHED" as const,
    };
}

// ------------------------------
// Create Session + Token
// ------------------------------
async function createSessionAndToken(): Promise<{
    session: string;
    token: string;
}> {
    const response = await client.get(
        `${BASE_URL}/openarea/tenderListingPage.action`
    );

    const cookies = response.headers["set-cookie"];
    if (!cookies) throw new Error("No session cookie received");

    const jsession = cookies.find((c: string) =>
        c.startsWith("JSESSIONID")
    );

    if (!jsession) throw new Error("JSESSIONID not found");

    const sessionCookie = jsession.split(";")[0];

    const html = response.data;

    const tokenMatch = html.match(
        /id="Authorization"[^>]*value="([^"]+)"/
    );

    if (!tokenMatch) throw new Error("Bearer token not found");

    const bearerToken = tokenMatch[1];

    console.log("Session Created:", sessionCookie);
    console.log("Token Extracted");

    return {
        session: sessionCookie,
        token: bearerToken,
    };
}

// ------------------------------
// Fetch List
// ------------------------------
async function fetchTenderList(session: string, token: string) {
    const response = await client.post(
        `${BASE_URL}/rest/openarea/getTenderList`,
        {
            orgId: "538",
            deptId: "",
            dateParam: "",
            startDate: null,
            endDate: null,
            closeDateFrom: "",
            closeDateTo: "",
            procatId: "",
            typeId: "",
            textFilter: null,
        },
        {
            headers: {
                Cookie: session,
                Authorization: token,
                "Auth-Token": "X-Requested-With",
                Referer: `${BASE_URL}/openarea/tenderListingPage.action`,
                Origin: "https://eproc2.bihar.gov.in",
                "User-Agent": "Mozilla/5.0",
            },
        }
    );

    return response?.data || [];
}

// ------------------------------
// Fetch Detail
// ------------------------------
async function fetchTenderDetails(tenderId: number, session: string, token: string) {
    const response = await client.post(
        `${BASE_URL}/rest/quotation/previewTenderByTenderId?tenderId=${tenderId}`,
        {},
        {
            headers: {
                Cookie: session,
                Authorization: token,
                "Auth-Token": "X-Requested-With",
                Referer: `${BASE_URL}/openarea/tenderListingPage.action`,
                Origin: "https://eproc2.bihar.gov.in",
                "User-Agent": "Mozilla/5.0",
            },
        }
    );

    return response.data;
}

// ------------------------------
// MAIN SYNC
// ------------------------------
export async function syncTenders() {
    try {
        console.log("Starting Tender Sync...");

        const { session, token } = await createSessionAndToken();

        const tenders = await fetchTenderList(session, token);
        const bulkOps: any[] = [];

        await Promise.all(
            tenders.map((t: any) =>
                limit(async () => {
                    const detail = await fetchTenderDetails(
                        t.currenttenderid,
                        session,
                        token
                    );

                    const mapped = await mapGovTenderToApp(detail);

                    bulkOps.push({
                        replaceOne: {
                            filter: { tenderId: mapped.tenderId },
                            replacement: mapped,
                            upsert: true
                        }
                    });
                })
            )
        );

        if (bulkOps.length > 0) {
            await Tender.bulkWrite(bulkOps);
            console.log(`Replaced ${bulkOps.length} tenders`);
        }

        console.log("Sync Completed");

        return {
            message: "Sync Completed",
            success: true
        }

    } catch (err: any) {
        console.error(" Sync Failed:", err.message);
    }
}