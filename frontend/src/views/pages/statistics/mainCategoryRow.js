import { fCurrency } from 'src/utils/format-number'
import {
  Box,
  useTheme,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import Icon from 'src/@core/components/icon'

const MainCategoryRow = props => {
  const theme = useTheme()
  const { category, categoryStats, transactionType } = props
  const singleCatStat = categoryStats?.categories.find(ct => ct.categoryId === category.category_id)

  const [editedCategoryName, setEditedCategoryName] = useState(category.category_name)
  const [isEditing, setIsEditing] = useState(false)

  const handleCategoryNameChange = event => {
    setEditedCategoryName(event.target.value)
  }

  const handleSaveCategoryEdit = async () => {}

  return (
    <Accordion sx={{ mx: 3, bgcolor: 'background.default', boxShadow: 0 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ ml: 3, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ mr: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
              {isEditing ? (
                <TextField
                  size='small'
                  value={editedCategoryName}
                  onChange={handleCategoryNameChange}
                  autoFocus
                  fullWidth
                />
              ) : (
                <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {editedCategoryName}
                </Typography>
              )}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
            {isEditing ? (
              <>
                <Tooltip title='Salva cambiamento'>
                  <IconButton color='success' onClick={handleSaveCategoryEdit}>
                    <Icon icon='material-symbols-light:save' />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Annulla azione'>
                  <IconButton
                    color='error'
                    onClick={() => {
                      setIsEditing()
                      setEditedCategoryName(category.category_name)
                    }}
                  >
                    <Icon icon='material-symbols-light:cancel' />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title='Modifica nome categoria'>
                <IconButton onClick={() => setIsEditing(true)}>
                  <Icon icon='material-symbols:edit' />
                </IconButton>
              </Tooltip>
            )}
            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
              {fCurrency(singleCatStat?.totalAmount)}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {category?.subcategories &&
          category?.subcategories.map(subcategory => (
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
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {subcategory.subcategory_name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {fCurrency(
                    singleCatStat?.subcategories.find(sub => sub.subCategoryId === subcategory.subcategory_id)
                      ?.totalAmount
                  )}
                </Typography>
              </Box>
            </Box>
          ))}
      </AccordionDetails>
    </Accordion>
  )
}

export default MainCategoryRow
