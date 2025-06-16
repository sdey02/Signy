export type SigningEventType = 'viewed' | 'signed';

export async function trackSigningEvent(documentId: string, eventType: SigningEventType) {
  try {
    const res = await fetch('/api/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ documentId, eventType }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('Failed to track event', error);
    }
  } catch (err) {
    console.error('Error tracking event:', err);
  }
}
