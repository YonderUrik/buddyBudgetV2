// src/layouts/components/acl/CanViewNavLink.js
import { useAuth0 } from '@auth0/auth0-react'

const CanViewNavLink = props => {
  const { children, navLink } = props

  const auth = useAuth0()

  if (auth.isAuthenticated || (navLink && navLink.auth === false)) {
    return <>{children}</>
  } else {
    return null
  }
}

export default CanViewNavLink
