
import Engineer from "../../models/company/engineer/Engineer";
import { createCompanyChildCrud } from "./companyChild.factory";

export const EngineerController = createCompanyChildCrud(Engineer);
