// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports
import DateOptionsMenu from 'src/utils/date-options'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import Icon from 'src/@core/components/icon'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { dateOptions } from './card-income-vs-expense'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { fCurrency } from 'src/utils/format-number'
import { useRouter } from 'next/router'
import axiosInstance from 'src/utils/axios'
import { useAuth0 } from '@auth0/auth0-react'

const ExpensePerCategory = props => {
  // ** Hook
  const theme = useTheme()
  const [categories, setCategories] = useState([])
  const [totalAmounts, setTotalAmounts] = useState([])
  const router = useRouter()
  const { balanceview } = props

  const [isLoading, setIsLoading] = useState(false)
  const [selectedDateOption, setSelectedDateOption] = useState(dateOptions[0])

  const series = [
    {
      name: 'Speso',
      data: totalAmounts
    }
  ]

  const auth = useAuth0()

  const getData = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = await auth.getAccessTokenSilently()

      const response = await axiosInstance.post(
        '/home/get-expense-per-category',
        { selectedDateOption },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      const { data } = response
      setCategories(data.map(category => category.categoryId))
      setTotalAmounts(data.map(amount => amount.totalAmount))
    } catch (error) {
      toast.error(error.message || error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedDateOption])

  useEffect(() => {
    getData()
  }, [getData])

  const options = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },

    plotOptions: {
      bar: {
        borderRadius: 8,
        barHeight: '60%',
        horizontal: true,
        distributed: true,
        startingShape: 'rounded'
      }
    },
    dataLabels: {
      offsetY: 8,
      style: {
        fontWeight: 600,
        fontSize: '0.9rem'
      },
      formatter: function (value) {
        if (balanceview) {
          return fCurrency(value)
        }

        return '******'
      }
    },
    grid: {
      strokeDashArray: 8,
      borderColor: theme.palette.divider,
      xaxis: {
        lines: { show: true }
      },
      yaxis: {
        lines: { show: false }
      },
      padding: {
        top: -18,
        left: 21,
        right: 33,
        bottom: 10
      }
    },
    colors: [
      hexToRGBA(theme.palette.primary.light, 1),
      hexToRGBA(theme.palette.success.light, 1),
      hexToRGBA(theme.palette.warning.light, 1),
      hexToRGBA(theme.palette.info.light, 1),
      hexToRGBA(theme.palette.error.light, 1)
    ],
    legend: { show: false },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: categories,
      labels: {
        // formatter: val => `${Number(val) / 1000}k`,
        style: {
          fontSize: '0.875rem',
          colors: theme.palette.text.disabled
        }
      }
    },
    yaxis: {
      labels: {
        align: theme.direction === 'rtl' ? 'right' : 'left',
        style: {
          fontWeight: 600,
          fontSize: '0.875rem',
          colors: theme.palette.text.primary
        }
      }
    },
    tooltip: {
      enabled: true,
      theme: theme.palette.mode === 'light' ? 'light' : 'dark',
      y: {
        formatter: function (val) {
          if (balanceview) {
            return fCurrency(parseFloat(val))
          }

          return '******'
        }
      }
    } // Disabilita il tooltip dei valori
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 6.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant='body2'>
              Spese per categoria <b>{selectedDateOption}</b>
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Typography variant='h6'>
                {balanceview
                  ? fCurrency(totalAmounts.reduce((accumulator, currentValue) => accumulator + currentValue, 0))
                  : '******'}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              alignContent: 'center'
            }}
          >
            <DateOptionsMenu
              iconProps={{ fontSize: 24 }}
              options={dateOptions}
              onChangeOption={option => setSelectedDateOption(option)}
              iconButtonProps={{ size: 'small', className: 'card-more-options', sx: { color: 'text.secondary' } }}
            />
            <Button
              onClick={() => router.push('/statistiche')}
              size='small'
              variant='outlined'
              endIcon={<Icon icon='ic:outline-keyboard-arrow-right' />}
              sx={{ ml: 4 }}
            >
              Statistiche
            </Button>
          </Box>
        </Box>
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 294 }}>
            <CircularProgress />
          </div>
        )}
        {!isLoading && totalAmounts.length > 0 && (
          <ReactApexcharts key={balanceview} type='bar' height={294} series={series} options={options} />
        )}
        {!isLoading && totalAmounts.length === 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 294 }}>
            <Typography variant='subtitle1'>Nessuna spesa per l'intervallo selezionato</Typography>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ExpensePerCategory
