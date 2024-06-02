import { useState } from 'react'
import toast from 'react-hot-toast'

import { LoadingButton } from '@mui/lab'
import { IconButton, Tooltip } from '@mui/material'

import ConfirmDialog from 'src/@core/components/confirm-dialog'
import Icon from 'src/@core/components/icon'
import axiosInstance from 'src/utils/axios'
import { useAuth0 } from '@auth0/auth0-react'

const DeleteTransaction = props => {
  const { refreshAllData, _id } = props
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const auth = useAuth0()

  const submitDelete = async () => {
    setIsDeleting(true)
    try {
      const token = await auth.getAccessTokenSilently()
      await axiosInstance.post(
        '/transazioni/delete-transaction',
        { _id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      toast.success('Transazione eliminata')
      refreshAllData()
    } catch (error) {
      toast.error(error.message || error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Tooltip title='Elimina transaziones'>
        <IconButton onClick={() => setConfirmOpen(true)} color='error'>
          <Icon icon='mdi:delete-circle' />
        </IconButton>
      </Tooltip>
      <ConfirmDialog
        title='Sei sicuro?'
        content='Sei sicuro di voler eliminare la transazione selezionata?'
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        action={
          <LoadingButton onClick={submitDelete} loading={isDeleting} color='error' variant='contained'>
            Elimina
          </LoadingButton>
        }
      />
    </>
  )
}

export default DeleteTransaction
