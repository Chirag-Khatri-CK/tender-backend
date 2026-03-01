
import Audit from "../../models/company/Audit";
import { createCompanyChildCrud } from "./companyChild.factory";

export const AuditController = createCompanyChildCrud(Audit, "Audit");
