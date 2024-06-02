// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuth0 } from '@auth0/auth0-react'

const GuestGuard = props => {
  const { children, fallback } = props
  const auth = useAuth0()
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (!auth.isLoading && auth.isAuthenticated) {
      if (router?.query?.returnUrl) {
        router.replace(router?.query?.returnUrl)
      } else {
        router.replace('/')
      }
    }
  }, [router.route])

  if (auth.isLoading || !router.isReady) {
    return fallback
  }

  return <>{children}</>
}

export default GuestGuard
