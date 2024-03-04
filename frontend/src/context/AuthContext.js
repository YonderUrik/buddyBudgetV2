// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'src/utils/axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}
const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = document.cookie.split('; ').find(row => row.startsWith(authConfig.storageTokenKeyName + '='))
      console.log('storedToken', storedToken)
      if (storedToken) {
        setLoading(true)
        const token = storedToken.split('=')[1]
        await axios
          .get(authConfig.meEndpoint, {})
          .then(async response => {
            setLoading(false)
            setUser({ ...response.data.user })
            window.localStorage.setItem('user', response.data.user)
          })
          .catch(() => {
            // Handle token expiration or invalid token
            window.localStorage.removeItem('user')
            document.cookie = `${authConfig.storageTokenKeyName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
            setUser(null)
            setLoading(false)
            router.replace('/login')
          })
      } else {
        window.localStorage.removeItem('user')
        setLoading(false)
        router.replace('/login')
      }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params, errorCallback) => {
    axios
      .post('/auth/login', params) // Add withCredentials: true
      .then(async response => {
        const returnUrl = router.query.returnUrl
        setUser({ ...response.data.user }) // Assuming the user object is returned from the backend
        window.localStorage.setItem('user', response.data.user)
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL)
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    setUser(null)

    // Remove user data from local storage
    window.localStorage.removeItem('user')

    // Remove access token cookie
    document.cookie = `${authConfig.storageTokenKeyName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`

    // Redirect to login page
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
