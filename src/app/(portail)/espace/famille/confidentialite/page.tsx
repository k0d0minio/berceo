import { legalMetadata, SpaceLegalPage } from "../../legal-page";

/* The legal page inside the space, so the signed-in shell stays (JAM-582). */
export const metadata = legalMetadata("confidentialite");

export const dynamic = "force-dynamic";

export default function Page() {
  return <SpaceLegalPage role="parent" page="confidentialite" />;
}
