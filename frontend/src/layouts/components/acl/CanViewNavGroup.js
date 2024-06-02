// src/layouts/components/acl/CanViewNavGroup.js
import { useAuth0 } from '@auth0/auth0-react'

const CanViewNavGroup = props => {
  const { children, navGroup } = props

  const auth = useAuth0()

  if (auth.isAuthenticated || (navGroup && navGroup.auth === false)) {
    return <>{children}</>
  } else {
    return null
  }
}

export default CanViewNavGroup
