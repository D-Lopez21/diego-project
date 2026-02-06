import { useParams } from "react-router-dom";
import BillsDetailsPage from "../components/bills-details/BillsDetailsPage";

export default function BillDetails() {
  const { id } = useParams();
  return <BillsDetailsPage billId={id || null} />;
}