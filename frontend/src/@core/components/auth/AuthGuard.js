// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth'

const AuthGuard = props => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (!auth.loading && auth.user === null) {
      if (router.asPath !== '/') {
        router.replace({
          pathname: '/login',
          query: { returnUrl: router.asPath }
        })
      } else {
        router.replace('/login')
      }
    }

    // if (router.asPath !== '/') {
    //   router.replace({
    //     pathname: router.asPath
    //   })
    // }
  }, [router.route, auth])

  if (auth.loading || !router.isReady) {
    return fallback
  }

  return <>{children}</>

  // useEffect(
  //   () => {
  //     if (!router.isReady) {
  //       return
  //     }

  //     if (auth.user === null) {
  //       if (router.asPath !== '/') {
  //         router.replace({
  //           pathname: '/login',
  //           query: { returnUrl: router.asPath }
  //         })
  //       } else {
  //         router.replace('/login')
  //       }
  //     }
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [router.route]
  // )
  // if (auth.loading) {
  //   return fallback
  // }

  // return <>{children}</>
}

export default AuthGuard
