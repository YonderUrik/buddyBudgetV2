// ** React Imports
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'

// ** Axios Import
import axiosInstance from 'src/utils/axios'

const ServerSideNavItems = () => {
  // ** State
  const [menuItems, setMenuItems] = useState([])
  const auth = useAuth0()

  useEffect(async () => {
    const token = await auth.getAccessTokenSilently()
    axiosInstance
      .get('/api/vertical-nav/data', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        const menuArray = response.data
        setMenuItems(menuArray)
      })
  }, [])

  return { menuItems }
}

export default ServerSideNavItems
