import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = { title: "Live Map" };

export default function MapPage() {
  return (
    <PageContainer
      heading="Live Incident Map"
      subheading="Real-time geographic view of all active emergencies"
    >
      {/* TODO: Implement GoogleMapWidget component */}
      <div className="h-[600px] skeleton rounded-xl" />
    </PageContainer>
  );
}
