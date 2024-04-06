// ** React Imports
import { createContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'src/utils/axios'

// ** Config
import authConfig from 'src/configs/auth'
import toast from 'react-hot-toast'
import { Capacitor } from '@capacitor/core'
import { SavePassword } from 'capacitor-ios-autofill-save-password'

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
      setLoading(true)
      await axios
        .get(authConfig.meEndpoint, {})
        .then(async response => {
          setUser({ ...response.data.user })
          window.localStorage.setItem('user', response.data.user)
        })
        .catch(() => {
          // Handle token expiration or invalid token
          localStorage.clear()
          sessionStorage.clear()
          Cookies.remove('access_token_cookie')
          Cookies.remove('refresh_token_cookie')
          Cookies.remove('csrf_access_token')
          Cookies.remove('csrf_refresh_token')
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const confirmRegistration = (params, errorCallback) => {
    axios
      .post('/auth/confirm-registration', params)
      .then(async response => {
        router.replace('/login')
        toast.success('Account attivato con successo')
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleRegister = (params, errorCallback) => {
    axios
      .post('/auth/register', params)
      .then(async response => {
        router.replace({
          pathname: '/verify-registration',
          query: { email: params.email }
        })
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogin = (params, errorCallback) => {
    axios
      .post('/auth/login', params) // Add withCredentials: true
      .then(async response => {
        const returnUrl = router.query.returnUrl
        setUser({ ...response.data.user }) // Assuming the user object is returned from the backend
        window.localStorage.setItem('user', response.data.user)
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL)
        if (Capacitor.getPlatform() === 'ios') {
          await SavePassword.promptDialog({
            email: params.email,
            password: params.password
          })
        }
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    axios
      .post('/auth/logout')
      .then(async response => {
        setUser(null)

        // Remove user data from local storage
        window.localStorage.clear()
        sessionStorage.clear()

        Cookies.remove('access_token_cookie')
        Cookies.remove('refresh_token_cookie')
        Cookies.remove('csrf_access_token')
        Cookies.remove('csrf_refresh_token')

        // Redirect to login page
        router.push('/login')
      })
      .catch(error => {
        toast.error(error.message || error)
      })
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    confirm_registration: confirmRegistration
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
