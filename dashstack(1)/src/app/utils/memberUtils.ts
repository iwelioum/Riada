export function formatMemberSince(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  
  // Basic fallback if invalid date
  if (isNaN(created.getTime())) return "Unknown";
  
  const months = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
  const monthName = created.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  
  return `${Math.max(0, months)} months (${monthName})`;
}

export function computeRisk(status: string, lastVisitDate: string | null): number {
  if (status === "Suspended") return 85;
  if (status === "Anonymized") return 0;
  if (!lastVisitDate) return 70;
  
  // Random score for mock purposes, but weighted by status
  return Math.floor(Math.random() * 40);
}
