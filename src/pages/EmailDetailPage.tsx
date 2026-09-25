import { useParams } from "react-router-dom";
import { EmailDashboard } from "../components/EmailDashboard";

/** Route /email/:id — dashboard for one specific temporary address. */
export function EmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  // `key` remounts the dashboard fresh when navigating between addresses.
  return <EmailDashboard key={id ?? ""} accountId={id ?? ""} />;
}
