import axios from 'axios'

import { HOST_API } from './config-global'

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API, withCredentials: true })

// Add a request interceptor
axiosInstance.interceptors.request.use(
  config => {
    // Check if the request method is POST, PUT, or DELETE
    try {
      if (['POST', 'PUT', 'DELETE'].includes(config.method.toUpperCase())) {
        // Get the CSRF token from your cookies (you might need to use a library for this)
        const csrfToken = getCsrfTokenFromCookies()

        // Set the X-CSRF-TOKEN header with the CSRF token
        if (csrfToken) {
          config.headers['X-CSRF-TOKEN'] = csrfToken
        }
      }
    } catch (error) {
      console.error(error)
    }

    return config
  },
  error => Promise.reject(error)
)

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (originalRequest.url !== '/auth/refresh' && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      await axiosInstance.get('/auth/refresh')

      return axiosInstance(originalRequest)
    }

    return Promise.reject((error.response && error.response.data) || 'Something went wrong')
  }
)

function getCsrfTokenFromCookies() {
  const cookies = document.cookie
    .split(';')
    .map(cookie => cookie.trim())
    .reduce((cookieMap, cookie) => {
      const [name, value] = cookie.split('=')
      cookieMap[name] = decodeURIComponent(value)

      return cookieMap
    }, {})

  return cookies.csrf_access_token || null
}

export default axiosInstance

// ----------------------------------------------------------------------

export const fetcher = async args => {
  const [url, config] = Array.isArray(args) ? args : [args]

  const res = await axiosInstance.get(url, { ...config })

  return res.data
}
