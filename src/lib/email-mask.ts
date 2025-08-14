/**
 * Email masking utility for security
 * Masks email addresses to prevent exposure in UI and localStorage
 */

export function maskEmailForDisplay(email: string): string {
  if (!email || !email.includes('@')) {
    return email;
  }
  
  const [username, domain] = email.split('@');
  
  // For very short usernames, show first character + ***
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  
  // For longer usernames, show first 2 characters + *** + last character
  if (username.length <= 4) {
    return `${username.slice(0, 2)}***@${domain}`;
  }
  
  // For longer usernames, show first 3 characters + *** + last character  
  return `${username.slice(0, 3)}***${username.slice(-1)}@${domain}`;
}

export function sanitizeUserDataForStorage(userData: any): any {
  if (!userData) return userData;
  
  // Remove email from localStorage storage
  const { email, ...sanitizedData } = userData;
  
  return {
    ...sanitizedData,
    // Keep only masked email for display purposes if needed
    email_masked: email ? maskEmailForDisplay(email) : undefined
  };
}
