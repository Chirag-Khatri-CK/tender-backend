
import Director from "../../models/company/Director";
import { createCompanyChildCrud } from "./companyChild.factory";

export const DirectorController = createCompanyChildCrud(Director);
