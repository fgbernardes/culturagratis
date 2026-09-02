import { getAdminApiUser } from "../../../../admin-auth";
import { updateSubmissionStatus, type SubmissionStatus } from "../../../../../db/submissions";

export const dynamic = "force-dynamic";
type RouteProps = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteProps) {
  const user = await getAdminApiUser();
  if (!user) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });

  const id = Number((await params).id);
  const payload = await request.json() as { status?: string };
  const statuses: SubmissionStatus[] = ["received", "review", "resolved", "archived"];
  if (!Number.isInteger(id) || !statuses.includes(payload.status as SubmissionStatus)) {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }
  try {
    return Response.json({ submission: await updateSubmissionStatus(id, payload.status as SubmissionStatus, user.email) });
  } catch {
    return Response.json({ error: "Não foi possível atualizar a submissão." }, { status: 500 });
  }
}
