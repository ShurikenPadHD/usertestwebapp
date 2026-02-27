'use client'

import { useEffect, useRef } from 'react'

const LOG = (data: object, hypothesisId: string) => {
  const payload = {
    sessionId: '0c32ad',
    location: 'SidebarScrollDebug.tsx',
    message: 'Sidebar scroll debug',
    data,
    timestamp: Date.now(),
    hypothesisId,
  }
  fetch('http://127.0.0.1:7470/ingest/6f3c770d-a54a-4d4c-827d-876e5cf3453c', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '0c32ad' },
    body: JSON.stringify(payload),
  }).catch(() => {})
}

export function SidebarScrollDebug() {
  const mainRef = useRef<HTMLElement | null>(null)
  const lastMainScroll = useRef(0)
  const lastWindowScroll = useRef(0)

  useEffect(() => {
    // #region agent log
    const main = document.querySelector('main')
    mainRef.current = main
    const parent = main?.parentElement
    const sidebar = parent?.querySelector('aside')

    const report = () => {
      if (!main || !parent) return
      const vh = window.innerHeight
      const bodyScroll = document.documentElement.scrollTop || document.body.scrollTop
      const mainScroll = main.scrollTop
      const mainHeight = main.offsetHeight
      const mainScrollHeight = main.scrollHeight
      const mainOverflows = mainScrollHeight > mainHeight
      const parentHeight = parent.offsetHeight
      const bodyScrollHeight = document.documentElement.scrollHeight

      LOG(
        {
          vh,
          bodyScroll,
          mainScroll,
          mainHeight,
          mainScrollHeight,
          mainOverflows,
          parentHeight,
          bodyScrollHeight,
          bodyHasScroll: bodyScrollHeight > vh,
        },
        'A'
      )
    }

    report()
    const t = setTimeout(report, 500)
    // #endregion

    const onScroll = (e: Event) => {
      const target = e.target as HTMLElement
      const main = mainRef.current
      const bodyScroll = document.documentElement.scrollTop || document.body.scrollTop
      const mainScroll = main?.scrollTop ?? 0

      // #region agent log
      if (bodyScroll !== lastWindowScroll.current || mainScroll !== lastMainScroll.current) {
        lastWindowScroll.current = bodyScroll
        lastMainScroll.current = mainScroll
        LOG(
          {
            bodyScroll,
            mainScroll,
            scrollTarget: target.tagName,
            scrollTargetIsMain: target === main,
          },
          'B'
        )
      }
      // #endregion
    }

    window.addEventListener('scroll', onScroll, { capture: true })
    main?.addEventListener('scroll', onScroll)
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', onScroll, { capture: true })
      main?.removeEventListener('scroll', onScroll)
    }
  }, [])

  return null
}
