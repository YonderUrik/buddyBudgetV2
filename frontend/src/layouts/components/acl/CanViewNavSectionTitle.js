// src/layouts/components/acl/CanViewNavSectionTitle.js
import { useAuth0 } from '@auth0/auth0-react'

const CanViewNavSectionTitle = props => {
  const { children, navTitle } = props

  const auth = useAuth0()

  if (auth.isAuthenticated || (navTitle && navTitle.auth === false)) {
    return <>{children}</>
  } else {
    return null
  }
}

export default CanViewNavSectionTitle
