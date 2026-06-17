'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang='en'>
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
          background: '#F8F6FC',
          color: '#1A1028',
        }}>
        <div
          style={{
            display: 'flex',
            minHeight: '100dvh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            textAlign: 'center',
          }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Kapruka Agent is unavailable
          </h1>
          <p
            style={{
              marginTop: '0.5rem',
              maxWidth: '20rem',
              fontSize: '0.9375rem',
              color: '#5C5470',
              lineHeight: 1.5,
            }}>
            Please refresh the page or try again in a moment.
          </p>
          <button
            type='button'
            onClick={reset}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              background: '#422B73',
              color: '#fff',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}>
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
