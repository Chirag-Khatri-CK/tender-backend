
import ExistingCommitment from "../../models/company/ExistingCommitment";
import { createCompanyChildCrud } from "./companyChild.factory";

export const ExistingCommitmentController = createCompanyChildCrud(ExistingCommitment, "ExistingCommitment");
