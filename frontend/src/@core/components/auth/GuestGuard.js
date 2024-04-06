// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth'

const GuestGuard = props => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (!auth.loading && auth.user) {
      if (router?.query?.returnUrl) {
        router.replace(router?.query?.returnUrl)
      } else {
        router.replace('/')
      }
    }
  }, [router.route])

  if (auth.loading || !router.isReady) {
    return fallback
  }

  return <>{children}</>

  // useEffect(() => {
  //   if (!router.isReady) {
  //     return
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [router.route])

  // if (auth.user !== null) {
  //   router.replace('/')
  // }

  // if (auth.loading) {
  //   return fallback
  // }

  // return <>{children}</>
}

export default GuestGuard
