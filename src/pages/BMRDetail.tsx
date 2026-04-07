import { useParams } from "react-router-dom";
import BMRWizard from "@/components/bmr/BMRWizard";

const BMRDetail = () => {
  const { id } = useParams<{ id: string }>();
  return <BMRWizard bmrId={id || ""} />;
};

export default BMRDetail;
