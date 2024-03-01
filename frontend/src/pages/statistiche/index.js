import { Box, Card, CardContent, CircularProgress, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'src/utils/axios'
import DateOptionsMenu from 'src/utils/date-options'
import { dateOptions } from 'src/views/pages/home/card-income-vs-expense'
import MainCategoryRow from 'src/views/pages/statistics/mainCategoryRow'

const Statistiche = () => {
  const [list, setList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [categoriesList, setCategoriesList] = useState({})

  const [transactionType, setTransactionType] = useState('out')
  const [selectedDateOption, setSelectedDateOption] = useState(dateOptions[0])

  const filteredList = list.find(ls => ls._id === transactionType)

  const getList = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.post('/categorie/get-categories-statistics', { selectedDateOption })
      const { data } = response
      console.log('data', data)
      setList(data)
    } catch (error) {
      toast.error(error.message || error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedDateOption])

  const getCategories = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/home/get-categories')
      const { data } = response
      setCategoriesList(data)
    } catch (error) {
      toast.error(error.message || error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    getList()
    getCategories()
  }, [getList, getCategories])

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ mb: 6.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box alignItems='center' alignContent='center'>
            <Typography variant='h6' alignItems='center' alignContent='center'>
              Statistiche <b>{transactionType === 'in' ? 'Entrate' : 'Uscite'}</b> <b>{selectedDateOption}</b>
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              alignContent: 'center',
            }}
          >
            {isLoading && <CircularProgress size={20} />}
            <ToggleButtonGroup
              size='small'
              value={transactionType}
              exclusive
              onChange={(event, newValue) => setTransactionType(newValue)}
            >
              <ToggleButton color='success' value='in'>
                Entrate
              </ToggleButton>
              <ToggleButton color='error' value='out'>
                Uscite
              </ToggleButton>
            </ToggleButtonGroup>
            <DateOptionsMenu
              iconProps={{ fontSize: 24 }}
              options={dateOptions}
              onChangeOption={option => setSelectedDateOption(option)}
              iconButtonProps={{ size: 'small', className: 'card-more-options', sx: { color: 'text.secondary' } }}
            />
          </Box>
        </Box>

        <Box key={transactionType}>
          {!isLoading &&
            filteredList &&
            Object.keys(categoriesList).length > 0 &&
            categoriesList[transactionType].map(category => (
              <MainCategoryRow
                key={category.category_id}
                category={category}
                categoryStats={filteredList}
                transactionType={transactionType}
              />
            ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default Statistiche
