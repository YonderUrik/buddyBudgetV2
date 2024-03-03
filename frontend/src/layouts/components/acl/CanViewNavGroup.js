// src/layouts/components/acl/CanViewNavGroup.js
import { useAuth } from 'src/hooks/useAuth'

const CanViewNavGroup = props => {
  const { children, navGroup } = props

  const auth = useAuth()

  if (auth.user || (navGroup && navGroup.auth === false)) {
    return <>{children}</>
  } else {
    return null
  }
}

export default CanViewNavGroup
