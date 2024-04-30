// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import { useAuth } from 'src/hooks/useAuth'
import Icon from 'src/@core/components/icon'
import { useCallback, useEffect, useState } from 'react'
import { fCurrency } from 'src/utils/format-number'
import toast from 'react-hot-toast'
import axios from 'src/utils/axios'
import { IconButton, Tooltip } from '@mui/material'
import AddTransactionDrawer from '../transactions/add-transaction-drawer'

const FastAddTransaction = props => {
  // ** Hook
  const [netWorth, setNetWorth] = useState(0)
  const auth = useAuth()

  const { onChangeShowBalance, balanceview, refreshAllData } = props

  const getData = useCallback(async () => {
    try {
      const response = await axios.post('/home/get-total-networth', {})
      const { data } = response
      setNetWorth(data)
    } catch (error) {
      toast.error(error.message || error)
    }
  }, [])

  useEffect(() => {
    getData()
  }, [getData])

  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent sx={{ p: theme => `${theme.spacing(6.75, 7.5)} !important` }}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h5' sx={{ mb: 4.5 }}>
                  Bentornato/a{' '}
                  <Box component='span' sx={{ fontWeight: 'bold' }}>
                    {auth?.user?.firstName}
                  </Box>
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Tooltip title={balanceview ? 'Nascondi saldi' : 'Mostra saldi'}>
                  <IconButton onClick={onChangeShowBalance}>
                    <Icon icon={balanceview ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            {/* PATRIMONIO */}
            <Typography variant='body1'>
              Il tuo patrimonio totale è di
              <Box component='span' sx={{ fontWeight: 600 }}>
                {' '}
                {balanceview ? fCurrency(netWorth) : '******'}
              </Box>
            </Typography>
            {/* AGGIUNGI TRANSAZIONE */}
            <AddTransactionDrawer refreshAllData={refreshAllData} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default FastAddTransaction
