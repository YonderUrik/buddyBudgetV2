import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import { CircularProgress } from '@mui/material'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import DateOptionsMenu from 'src/utils/date-options'
import axios from 'src/utils/axios'
import { fCurrency, fPercent } from 'src/utils/format-number'

export const dateOptions = [
  'mese corrente',
  'scorso mese',
  'ultimi 3 mesi',
  'ultimi 6 mesi',
  'ultimi 12 mesi',
  'anno corrente',
  'scorso anno',
  'da sempre'
]

const CardIncomeVsExpense = props => {
  const [income, setIncome] = useState(0)
  const { balanceview } = props
  const [expense, setExpense] = useState(0)
  const saving_rate = (income - expense) / income

  const [isLoading, setIsLoading] = useState(false)
  const [selectedDateOption, setSelectedDateOption] = useState(dateOptions[0])

  const getData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.post('/home/get-income-vs-expense', { selectedDateOption })
      const { data } = response
      setIncome(data[0])
      setExpense(data[1])
    } catch (error) {
      toast.error(error.message || error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedDateOption])

  useEffect(() => {
    getData()
  }, [getData])

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 6.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant='body2'>
              Flusso di cassa <b>{selectedDateOption}</b>
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                '& svg': { color: saving_rate > 0 ? 'success.main' : 'error.main' }
              }}
            >
              <Typography sx={{ color: saving_rate > 0 ? 'success.main' : 'error.main' }} variant='h6'>
                {income - expense > 0 && '+'}
                {balanceview ? fCurrency(income - expense) : '******'}
              </Typography>
              {saving_rate !== -Infinity && (
                <>
                  <Icon icon={saving_rate > 0 ? 'icon-park-outline:up' : 'icon-park-outline:down'} />
                  <Typography variant='subtitle2' sx={{ color: saving_rate > 0 ? 'success.main' : 'error.main' }}>
                    {saving_rate > 0 && '+'}
                    {fPercent(saving_rate * 100)}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <DateOptionsMenu
              iconProps={{ fontSize: 24 }}
              options={dateOptions}
              onChangeOption={option => setSelectedDateOption(option)}
              iconButtonProps={{ size: 'small', className: 'card-more-options', sx: { color: 'text.secondary' } }}
            />
          </Box>
        </Box>
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* ENTRATE */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center' }}>
              <CustomAvatar
                skin='light'
                color='success'
                variant='rounded'
                sx={{ mr: 1.5, height: 24, width: 24, borderRadius: '6px' }}
              >
                <Icon icon='majesticons:money-plus-line' fontSize='0.875rem' />
              </CustomAvatar>
              <Typography variant='body2'>Entrate</Typography>
            </Box>
            <Typography variant='h6'>{balanceview ? fCurrency(income) : '******'}</Typography>
          </Box>
          <Divider flexItem sx={{ m: 0 }} orientation='vertical'>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <CustomAvatar
                skin='light'
                color='secondary'
                sx={{ height: 24, width: 24, fontSize: '0.6875rem', color: 'text.secondary' }}
              >
                VS
              </CustomAvatar>
            )}
          </Divider>
          {/* USCITE */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
            <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ mr: 1.5 }} variant='body2'>
                Uscite
              </Typography>
              <CustomAvatar
                color='error'
                skin='light'
                variant='rounded'
                sx={{ height: 24, width: 24, borderRadius: '6px' }}
              >
                <Icon icon='majesticons:money-minus-line' fontSize='0.875rem' />
              </CustomAvatar>
            </Box>
            <Typography variant='h6'>{balanceview ? fCurrency(expense) : '******'}</Typography>
          </Box>
        </Box>
        <LinearProgress
          value={saving_rate !== -Infinity ? saving_rate * 100 : 0}
          variant='determinate'
          sx={{
            height: 10,
            '&.MuiLinearProgress-colorPrimary': { backgroundColor: 'error.main' },
            '& .MuiLinearProgress-bar': {
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              backgroundColor: 'success.main'
            }
          }}
        />
      </CardContent>
    </Card>
  )
}

export default CardIncomeVsExpense
