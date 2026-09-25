import { SPACES } from "@/lib/auth/routing";

/**
 * « Absences signalées »: the founders' old list (D-106), now a permanent
 * redirect to the reports, which list absences with cancellations
 * (back-office-admin, D-132).
 */
export const ADMIN_ABSENCES_PATH = `${SPACES.admin}/absences`;
