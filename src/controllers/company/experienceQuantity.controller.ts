
import ExperienceQuantity from "../../models/company/ExperienceQuantity";
import { createCompanyChildCrud } from "./companyChild.factory";

export const ExperienceQuantityController = createCompanyChildCrud(ExperienceQuantity, "ExperienceQuantity");
