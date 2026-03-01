
import Equipment from "../../models/company/Equipment";
import { createCompanyChildCrud } from "./companyChild.factory";

export const EquipmentController = createCompanyChildCrud(Equipment, "Equipment");
