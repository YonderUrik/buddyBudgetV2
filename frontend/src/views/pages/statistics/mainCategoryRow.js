import toast from 'react-hot-toast'
import { useState } from 'react'

import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { fCurrency } from 'src/utils/format-number'
import Icon from 'src/@core/components/icon'
import SubCategoryRow from './subCategoryRow'
import axiosInstance from 'src/utils/axios'
import { useAuth0 } from '@auth0/auth0-react'

const MainCategoryRow = props => {
  const { category, categoryStats, transactionType } = props
  const singleCatStat = categoryStats?.categories.find(ct => ct.categoryId === category.category_id)
  const [isSaving, setIsSaving] = useState(false)

  const [editedCategoryName, setEditedCategoryName] = useState(category.category_name)
  const [isEditing, setIsEditing] = useState(false)

  const handleCategoryNameChange = event => {
    setEditedCategoryName(event.target.value)
  }
  const auth = useAuth0()

  const handleSaveCategoryEdit = async event => {
    event.stopPropagation()
    try {
      setIsSaving(true)
      const token = await auth.getAccessTokenSilently()
      await axiosInstance.post(
        '/categorie/edit-category-name',
        {
          category_id: category.category_id,
          new_category_name: editedCategoryName,
          transaction_type: transactionType
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      toast.success('Nome categoria modificato')
      setIsEditing(false)
    } catch (error) {
      toast.error(error.message || error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Accordion sx={{ mx: 3, bgcolor: 'background.default', boxShadow: 0 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} onClick={event => event.stopPropagation()}>
        <Box sx={{ ml: 3, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ mr: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
              {isEditing ? (
                <Box sx={{ display: 'flex', alignContent: 'center', alignItems: 'center' }}>
                  <TextField
                    size='small'
                    value={editedCategoryName}
                    onChange={handleCategoryNameChange}
                    autoFocus
                    fullWidth
                  />
                  <Tooltip title='Salva cambiamento'>
                    <IconButton color='success' onClick={handleSaveCategoryEdit}>
                      <Icon icon='fluent:save-20-regular' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Annulla azione'>
                    <IconButton
                      color='error'
                      onClick={event => {
                        event.stopPropagation()
                        setIsEditing(false)
                        setEditedCategoryName(category.category_name)
                      }}
                    >
                      <Icon icon='material-symbols-light:cancel-outline' />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignContent: 'center', alignItems: 'center' }}>
                  <Tooltip title='Modifica nome categoria'>
                    <IconButton
                      onClick={event => {
                        setIsEditing(true)
                        event.stopPropagation()
                      }}
                    >
                      <Icon icon='fluent:edit-20-regular' />
                    </IconButton>
                  </Tooltip>
                  <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {editedCategoryName}
                  </Typography>
                </Box>
              )}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
              {fCurrency(singleCatStat?.totalAmount)}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {category?.subcategories &&
          category?.subcategories.map(subcategory => (
            <SubCategoryRow
              key={`${subcategory.subcategory_id}-${category.category_id}`}
              subcategory={subcategory}
              category_id={category.category_id}
              transactionType={transactionType}
              singleCatStat={singleCatStat}
            />
          ))}
      </AccordionDetails>
    </Accordion>
  )
}

export default MainCategoryRow
