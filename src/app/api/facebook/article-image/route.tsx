import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const team = searchParams.get('team') || 'Sports News'
  const headline = searchParams.get('headline') || 'Latest Headlines'
  const source = searchParams.get('source') || ''

  const fontSize = headline.length > 80 ? 42 : 54

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#111111',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            color: '#C9A84C',
            fontSize: '32px',
            fontWeight: 'bold',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          {team}
        </div>

        <div
          style={{
            color: '#ffffff',
            fontSize: `${fontSize}px`,
            fontWeight: 'bold',
            lineHeight: '1.25',
            maxWidth: '1060px',
          }}
        >
          {headline}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          {source ? (
            <div style={{ color: '#666666', fontSize: '22px' }}>{source}</div>
          ) : (
            <div />
          )}
          <div
            style={{
              color: '#C9A84C',
              fontSize: '26px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            bragging-rights.online
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
