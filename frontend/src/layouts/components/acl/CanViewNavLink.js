// src/layouts/components/acl/CanViewNavLink.js
import { useAuth } from 'src/hooks/useAuth'

const CanViewNavLink = props => {
  const { children, navLink } = props

  const auth = useAuth()

  if (auth.user || (navLink && navLink.auth === false)) {
    return <>{children}</>
  } else {
    return null
  }
}

export default CanViewNavLink
