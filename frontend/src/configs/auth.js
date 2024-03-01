export default {
  meEndpoint: '/auth/me',
  storageTokenKeyName: 'csrf_access_token',
  onTokenExpiration: 'logout' // logout | refreshToken
}
