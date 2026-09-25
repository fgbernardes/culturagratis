import { getAdminApiUser } from "../../../../admin-auth";
import { EventTransitionError, updateEventAccess52, updateEventStatus, type EventStatus } from "../../../../../db/events";

export const dynamic = "force-dynamic";

type RouteProps = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteProps) {
  const user = await getAdminApiUser();
  if (!user) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });

  const id = (await params).id;
  const payload = await request.json() as { status?: string; access52?: boolean };
  const statuses: EventStatus[] = ["draft", "review", "verified", "published", "archived", "rejected"];
  if (!isUuid(id) || (typeof payload.access52 !== "boolean" && !statuses.includes(payload.status as EventStatus))) {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  try {
    const event = typeof payload.access52 === "boolean"
      ? await updateEventAccess52(id, payload.access52)
      : await updateEventStatus(id, payload.status as EventStatus, user.email);
    return Response.json({ event });
  } catch (error) {
    if (error instanceof EventTransitionError) return Response.json({ error: error.message }, { status: 409 });
    return Response.json({ error: "Não foi possível atualizar o estado." }, { status: 500 });
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
