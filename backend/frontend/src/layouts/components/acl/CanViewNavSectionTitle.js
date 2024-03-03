// src/layouts/components/acl/CanViewNavSectionTitle.js
import { useAuth } from 'src/hooks/useAuth'

const CanViewNavSectionTitle = props => {
  const { children, navTitle } = props

  const auth = useAuth()

  if (auth.user || (navTitle && navTitle.auth === false)) {
    return <>{children}</>
  } else {
    return null
  }
}

export default CanViewNavSectionTitle
