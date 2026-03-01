
import ExperienceCertificate from "../../models/company/ExperienceCertificate";
import { createCompanyChildCrud } from "./companyChild.factory";

export const ExperienceCertificateController = createCompanyChildCrud(ExperienceCertificate, "ExperienceCertificate");
