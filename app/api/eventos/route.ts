import { listPublishedEvents } from "../../../db/events";
import { toEventItem } from "../../data/events";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = (await listPublishedEvents()).map(toEventItem);
    return Response.json({ events }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
     } catch {
    return Response.json(
      { events: [], error: "A agenda está temporariamente indisponível." },
      { status: 503 },
    );
  }
}