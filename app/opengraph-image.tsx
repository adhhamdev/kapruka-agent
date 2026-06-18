import { ImageResponse } from 'next/og';
import { APP_DESCRIPTION, APP_NAME } from '@/constants/brand';

export const alt = 'Kapruka Agent — AI shopping concierge for Kapruka';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 32,
          padding: 72,
          background: '#422B73',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
        }}>
        <div
          style={{
            display: 'flex',
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
          }}>
          Meet {APP_NAME}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            lineHeight: 1.4,
            color: 'rgba(255,255,255,0.85)',
            maxWidth: 900,
          }}>
          {APP_DESCRIPTION}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 20,
            fontWeight: 600,
            color: '#FACE15',
          }}>
          Gifts · Flowers · Cakes · Sri Lanka Delivery
        </div>
      </div>
    ),
    { ...size },
  );
}
