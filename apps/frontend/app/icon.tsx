import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  const primary = '#6366f1';
  const secondary = '#10b981';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          borderRadius: 8,
          fontSize: 20,
          fontWeight: 700,
          color: 'white',
        }}
      >
        A
      </div>
    ),
    {
      ...size,
    }
  );
}

