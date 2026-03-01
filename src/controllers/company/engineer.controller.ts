
import Engineer from "../../models/company/Engineer";
import { createCompanyChildCrud } from "./companyChild.factory";

export const EngineerController = createCompanyChildCrud(Engineer);
