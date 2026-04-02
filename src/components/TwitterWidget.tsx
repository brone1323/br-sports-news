'use client'

import { useEffect, useRef } from 'react'

interface TwitterWidgetProps {
  xHandle: string
  primaryColor: string
  teamName: string
}

export default function TwitterWidget({ xHandle, primaryColor, teamName }: TwitterWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Load Twitter widget script if not already present
    if (!document.getElementById('twitter-wjs')) {
      const script = document.createElement('script')
      script.id = 'twitter-wjs'
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'
      document.body.appendChild(script)
    } else {
      // Script already loaded — render any pending widgets
      const tw = (window as Window & { twttr?: { widgets: { load: (el: HTMLElement) => void } } }).twttr
      tw?.widgets?.load(containerRef.current)
    }
  }, [xHandle])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="px-4 py-3 text-white text-sm font-bold uppercase tracking-wide"
        style={{ backgroundColor: primaryColor }}
      >
        {teamName} on X
      </div>
      <div ref={containerRef} className="p-3 overflow-hidden" style={{ maxHeight: '420px', overflowY: 'auto' }}>
        <a
          className="twitter-timeline"
          data-height="380"
          data-theme="light"
          data-chrome="noheader nofooter noborders"
          href={`https://twitter.com/${xHandle}`}
        >
          Tweets by @{xHandle}
        </a>
      </div>
    </div>
  )
}
