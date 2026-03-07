export type AppUserRole = "student" | "user";

export function getRoleFromEmail(email: string): AppUserRole {
  return email.trim().toLowerCase().endsWith("@kmitl.ac.th") ? "student" : "user";
}
