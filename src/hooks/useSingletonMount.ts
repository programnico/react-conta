// hooks/useSingletonMount.ts
'use client'

import { useEffect, useRef } from 'react'

const mountedPages = new Set<string>()

export function useSingletonMount(pageId: string) {
  const mountedRef = useRef(false)
  const isAlreadyMounted = mountedPages.has(pageId)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedPages.add(pageId)
      mountedRef.current = true
    }

    return () => {
      if (mountedRef.current) {
        mountedPages.delete(pageId)
        mountedRef.current = false
      }
    }
  }, [pageId])

  return {
    shouldRender: !isAlreadyMounted || mountedRef.current,
    isMounted: mountedRef.current
  }
}
