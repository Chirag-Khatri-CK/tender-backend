
import Bid from "../../models/company/Bid";
import { createCompanyChildCrud } from "./companyChild.factory";

export const BidController = createCompanyChildCrud(Bid, "Bid");
