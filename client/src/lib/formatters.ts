/**
 * Format a date to "Month Day, Year" format
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Format report title with standardized format: "Report #ID - Month Day, Year"
 */
export function formatReportTitle(result: { id: number, createdAt: string | Date }): string {
  return `Report #${result.id} - ${formatDate(result.createdAt)}`;
}