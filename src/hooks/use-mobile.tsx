import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Safe initialization for SSR/mobile
    if (typeof window === 'undefined') return false
    
    try {
      const isMobileDevice = window.innerWidth < MOBILE_BREAKPOINT
      console.log('🔄 Mobile detection:', { 
        windowWidth: window.innerWidth, 
        isMobile: isMobileDevice,
        userAgent: navigator.userAgent.substring(0, 50)
      })
      return isMobileDevice
    } catch (error) {
      console.error('❌ Error detecting mobile:', error)
      return false
    }
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
      console.log('🔄 Mobile state change:', { 
        windowWidth: window.innerWidth, 
        isMobile: newIsMobile 
      })
      setIsMobile(newIsMobile)
    }
    
    mql.addEventListener("change", onChange)
    
    // Set initial state
    onChange()
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
