'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import 'nprogress/nprogress.css'

export default function ProgressBar() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  // ⛔ Prevents server-side errors: only run on client
  if (typeof window !== 'undefined') {
    import('nprogress').then((nProgress) => {
      const np = nProgress.default
      np.configure({
        showSpinner: false,
        speed: 400,
        minimum: 0.15,
        easing: 'ease',
      })
      // ✅ Immediately start progress bar
      np.start()
    })
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    import('nprogress').then((nProgress) => {
      const np = nProgress.default

      // Skip progress on initial render
      if (isFirstRender.current) {
        isFirstRender.current = false
        return
      }

      // ✅ Start progress bar when pathname changes
      np.start()

      // ✅ Complete after small delay
      const timer = setTimeout(() => {
        np.done(true)
      }, 400)

      return () => clearTimeout(timer)
    })
  }, [pathname])

  return null
}
