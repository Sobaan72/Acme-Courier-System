import { PageHeader } from "@/components/ui";
import { AutoRefresh } from "@/components/auto-refresh";
import { DispatchBoard } from "@/components/dispatch-board";
import { getBoardOrders, getDrivers } from "@/lib/data";
import { HUBSPOT_PORTAL_ID } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dispatch" };

export default async function DispatchPage() {
  const [orders, drivers] = await Promise.all([getBoardOrders(), getDrivers()]);
  return (
    <>
      <PageHeader title="Dispatch" subtitle="Assign drivers and move orders along. Every change syncs to HubSpot, emails the customer and updates what the AI agents tell callers.">
        <AutoRefresh seconds={8} />
      </PageHeader>
      <DispatchBoard orders={orders} drivers={drivers} hubspotPortalId={HUBSPOT_PORTAL_ID} />
    </>
  );
}
