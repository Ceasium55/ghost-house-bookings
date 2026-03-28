// Hardcoded list of admin email addresses
const ADMIN_EMAILS = [
  'smskackov@outlook.com',
];

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
