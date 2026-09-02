import { createSupabaseAdminClient, unwrapSupabase } from "./supabase";

export type SubmissionKind = "event" | "correction";
export type SubmissionStatus = "received" | "review" | "resolved" | "archived";

export type SubmissionRecord = {
  id: number; kind: SubmissionKind; status: SubmissionStatus; name: string; email: string;
  organization: string | null; submitterRelation: "public" | "organizer" | null;
  organizationRole: string | null; promotionInterest: boolean; newsletterOptIn: boolean;
  eventTitle: string | null; eventReference: string | null; eventDate: string | null;
  endDate: string | null; dateMode: "single" | "range" | null; timeLabel: string | null;
  startTime: string | null; endTime: string | null; timeMode: "single" | "range" | null;
  venue: string | null; area: string | null; category: string | null; condition: string | null;
  sourceUrl: string | null; accessibility: string | null; details: string | null;
  privacyNoticeVersion: string; reviewedBy: string | null; createdAt: string; updatedAt: string;
};

export type CreateSubmissionInput = Omit<SubmissionRecord, "id" | "status" | "reviewedBy" | "createdAt" | "updatedAt">;
type SubmissionRow = Record<string, unknown>;

export async function createSubmission(input: CreateSubmissionInput) {
  const result = await createSupabaseAdminClient().rpc("create_submission_with_consent", {
    payload: {
      kind: input.kind, name: input.name, email: input.email, organization: input.organization,
      submitter_relation: input.submitterRelation, organization_role: input.organizationRole,
      promotion_interest: input.promotionInterest, newsletter_opt_in: input.newsletterOptIn,
      event_title: input.eventTitle, event_reference: input.eventReference, event_date: input.eventDate,
      end_date: input.endDate, date_mode: input.dateMode, time_label: input.timeLabel,
      start_time: input.startTime, end_time: input.endTime, time_mode: input.timeMode,
      venue: input.venue, area: input.area, category: input.category, condition: input.condition,
      source_url: input.sourceUrl, accessibility: input.accessibility, details: input.details,
      privacy_notice_version: input.privacyNoticeVersion,
    },
  }).single();
  return mapSubmission(unwrapSupabase(result) as SubmissionRow);
}

export async function listSubmissions(): Promise<SubmissionRecord[]> {
  const result = await createSupabaseAdminClient().from("submissions").select("*")
    .order("created_at", { ascending: false }).order("id", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  const order: Record<SubmissionStatus, number> = { received: 0, review: 1, resolved: 2, archived: 3 };
  return (result.data ?? []).map((row) => mapSubmission(row as SubmissionRow))
    .sort((a, b) => order[a.status] - order[b.status]);
}

export async function updateSubmissionStatus(id: number, status: SubmissionStatus, reviewedBy: string) {
  const result = await createSupabaseAdminClient().from("submissions").update({
    status, reviewed_by: reviewedBy, updated_at: new Date().toISOString(),
  }).eq("id", id).select("*").single();
  return mapSubmission(unwrapSupabase(result) as SubmissionRow);
}

function mapSubmission(row: SubmissionRow): SubmissionRecord {
  return {
    id: Number(row.id), kind: String(row.kind) as SubmissionKind, status: String(row.status) as SubmissionStatus,
    name: String(row.name), email: String(row.email), organization: nullable(row.organization),
    submitterRelation: nullable(row.submitter_relation) as "public" | "organizer" | null,
    organizationRole: nullable(row.organization_role), promotionInterest: Boolean(row.promotion_interest),
    newsletterOptIn: Boolean(row.newsletter_opt_in), eventTitle: nullable(row.event_title),
    eventReference: nullable(row.event_reference), eventDate: nullable(row.event_date), endDate: nullable(row.end_date),
    dateMode: nullable(row.date_mode) as "single" | "range" | null, timeLabel: nullable(row.time_label),
    startTime: nullable(row.start_time), endTime: nullable(row.end_time),
    timeMode: nullable(row.time_mode) as "single" | "range" | null, venue: nullable(row.venue),
    area: nullable(row.area), category: nullable(row.category), condition: nullable(row.condition),
    sourceUrl: nullable(row.source_url), accessibility: nullable(row.accessibility), details: nullable(row.details),
    privacyNoticeVersion: String(row.privacy_notice_version), reviewedBy: nullable(row.reviewed_by),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function nullable(value: unknown) {
  return value === null || value === undefined || value === "" ? null : String(value);
}
