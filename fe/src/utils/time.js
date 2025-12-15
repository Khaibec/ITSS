/**
 * Format date to "Just Now", "Xm ago", "Xh ago", "Xd ago" format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string in English
 */
export const formatTimeAgo = (date) => {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  
  // Handle future dates (shouldn't happen, but just in case)
  if (diffMs < 0) return "Just Now";

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Less than 1 minute
  if (diffMins < 1) return "Just Now";
  
  // Less than 1 hour
  if (diffMins < 60) return `${diffMins}m ago`;
  
  // Less than 24 hours
  if (diffHours < 24) return `${diffHours}h ago`;
  
  // Less than 7 days
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // Less than 30 days (weeks)
  if (diffDays < 30) return `${diffWeeks}w ago`;
  
  // Less than 365 days (months)
  if (diffDays < 365) return `${diffMonths}mo ago`;
  
  // Years
  return `${diffYears}y ago`;
};

