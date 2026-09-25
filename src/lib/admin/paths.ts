import { SPACES } from "@/lib/auth/routing";

/**
 * The back-office's pages (back-office-admin, D-132). The payments, ratings
 * and absences keep their paths in their own modules; the absences page now
 * answers with a permanent redirect to the reports.
 */
export const ADMIN_OVERVIEW_PATH = SPACES.admin;
export const ADMIN_FILES_PATH = `${SPACES.admin}/dossiers`;
export const ADMIN_USERS_PATH = `${SPACES.admin}/utilisateurs`;
export const ADMIN_REQUESTS_PATH = `${SPACES.admin}/demandes`;
export const ADMIN_BOOKINGS_PATH = `${SPACES.admin}/reservations`;
export const ADMIN_REPORTS_PATH = `${SPACES.admin}/signalements`;
export const ADMIN_JOURNAL_PATH = `${SPACES.admin}/journal`;

export function adminUserPath(userId: string): string {
  return `${ADMIN_USERS_PATH}/${userId}`;
}

export function adminFilePath(profileId: string): string {
  return `${ADMIN_FILES_PATH}/${profileId}`;
}
