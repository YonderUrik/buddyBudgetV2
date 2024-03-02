import { LoadingButton } from '@mui/lab'
import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'
import axios from 'src/utils/axios'

import { fCurrency } from 'src/utils/format-number'

const SubCategoryRow = props => {
  const { subcategory, category_id, transactionType, singleCatStat } = props

  const [isEditing, setIsEditing] = useState(false)
  const [editedSubCategory, setEditedSubCategory] = useState(subcategory.subcategory_name)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubcategoryNameChange = event => {
    setEditedSubCategory(event.target.value)
  }

  const handleSaveSubCategoryEdit = async event => {
    event.stopPropagation()
    try {
      setIsSaving(true)
      await axios.post('/categorie/edit-subcategory-name', {
        category_id: category_id,
        sub_category_id: subcategory.subcategory_id,
        new_sub_category_name: editedSubCategory,
        transaction_type: transactionType
      })
      toast.success('Nome sotto-categoria modificato')
      setIsEditing(false)
    } catch (error) {
      toast.error(error.message || error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Box
      sx={{
        p: 3,
        mx: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
        my: 3,
        borderRadius: 1,
        border: 1,
        borderColor: 'text.disabled'
      }}
    >
      <Box sx={{ mr: 2, display: 'flex', flexDirection: 'column' }}>
        {isEditing ? (
          <TextField
            size='small'
            value={editedSubCategory}
            onChange={handleSubcategoryNameChange}
            autoFocus
            fullWidth
          />
        ) : (
          <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
            {editedSubCategory}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
        {isEditing ? (
          <>
            <Tooltip title='Salva cambiamento'>
              <LoadingButton loading={isSaving} color='success' onClick={handleSaveSubCategoryEdit}>
                <Icon icon='material-symbols-light:save' />
              </LoadingButton>
            </Tooltip>
            <Tooltip title='Annulla azione'>
              <IconButton
                color='error'
                onClick={event => {
                  event.stopPropagation()
                  setIsEditing(false)
                  setEditedSubCategory(subcategory.subcategory_name)
                }}
              >
                <Icon icon='material-symbols-light:cancel' />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title='Modifica nome sotto-categoria'>
            <IconButton
              onClick={() => {
                setIsEditing(true)
              }}
            >
              <Icon icon='material-symbols:edit' />
            </IconButton>
          </Tooltip>
        )}
        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
          {fCurrency(
            singleCatStat?.subcategories.find(sub => sub.subCategoryId === subcategory.subcategory_id)?.totalAmount
          )}
        </Typography>
      </Box>
    </Box>
  )
}

export default SubCategoryRow
