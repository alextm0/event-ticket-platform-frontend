/**
 * Share utilities for tickets and events
 */

/**
 * Share a URL using the Web Share API (native share dialog) or fallback to copying to clipboard
 * @param url The URL to share
 * @param title Optional title for the share
 * @param text Optional text description for the share
 */
export async function shareUrl(url: string, title?: string, text?: string): Promise<boolean> {
  const shareData: ShareData = {
    url,
    ...(title && { title }),
    ...(text && { text }),
  };

  // Check if Web Share API is supported and available
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
      return false;
    }
  }

  // Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    // Final fallback: Use legacy clipboard API
    try {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (legacyError) {
      console.error('Legacy clipboard copy failed:', legacyError);
      return false;
    }
  }
}

/**
 * Share a ticket URL
 * @param ticketId The ticket ID
 * @param eventTitle Optional event title for the share message
 */
export async function shareTicket(ticketId: string, eventTitle?: string): Promise<boolean> {
  const url = `${window.location.origin}/tickets/${ticketId}`;
  const title = eventTitle ? `Check out my ticket for ${eventTitle}!` : 'Check out my event ticket!';
  const text = eventTitle ? `I'm going to ${eventTitle}!` : 'I have an event ticket to share.';
  
  return await shareUrl(url, title, text);
}

/**
 * Share an event URL
 * @param eventId The event ID
 * @param eventTitle Optional event title for the share message
 */
export async function shareEvent(eventId: string, eventTitle?: string): Promise<boolean> {
  const url = `${window.location.origin}/events/${eventId}`;
  const title = eventTitle ? `Check out ${eventTitle}!` : 'Check out this event!';
  const text = eventTitle ? `Join me at ${eventTitle}!` : 'Check out this awesome event!';
  
  return await shareUrl(url, title, text);
}
