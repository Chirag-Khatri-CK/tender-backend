
import Registration from "../../models/company/Registration";
import { createCompanyChildCrud } from "./companyChild.factory";

export const RegistrationController = createCompanyChildCrud(Registration, "Registration");
