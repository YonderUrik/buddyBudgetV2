import { useState } from 'react'
import toast from 'react-hot-toast'

import { LoadingButton } from '@mui/lab'
import { IconButton, Tooltip } from '@mui/material'

import ConfirmDialog from 'src/@core/components/confirm-dialog'
import Icon from 'src/@core/components/icon'
import axios from 'src/utils/axios'

const DeleteTransaction = props => {
  const { refreshAllData, _id } = props
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const submitDelete = async () => {
    setIsDeleting(true)
    try {
      await axios.post('/transazioni/delete-transaction', { _id })
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
