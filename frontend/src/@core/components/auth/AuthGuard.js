// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuth0 } from '@auth0/auth0-react'

const AuthGuard = props => {
  const { children, fallback } = props
  const auth = useAuth0()

  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (!auth.isLoading && !auth.isAuthenticated) {
      if (router.asPath !== '/') {
        router.replace({
          pathname: '/login',
          query: { returnUrl: router.asPath }
        })
      } else {
        router.replace('/login')
      }
    }
  }, [router.route, auth])

  if (auth.isLoading || !router.isReady) {
    return fallback
  }

  return <>{children}</>
}

export default AuthGuard
