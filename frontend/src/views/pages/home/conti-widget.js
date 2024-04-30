// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { fCurrency, fShortenNumber } from 'src/utils/format-number'
import { useCallback, useEffect, useState } from 'react'
import axio from 'src/utils/axios'
import toast from 'react-hot-toast'
import { Button } from '@mui/material'
import { useRouter } from 'next/router'

const ContiWidget = props => {
  const { balanceview } = props
  const [conti, setConti] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const getData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axio.post('/home/get-conti-summary', {})
      const { data } = response
      setConti(data)
    } catch (error) {
      toast.error(error.message || error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    getData()
  }, [getData])

  // ** Hook
  const theme = useTheme()

  const options = {
    chart: {
      sparkline: { enabled: true },
      padding: 0,
      margin: 0
    },
    colors: [
      hexToRGBA(theme.palette.primary.main, 0.8),
      hexToRGBA(theme.palette.secondary.main, 0.8),
      hexToRGBA(theme.palette.error.main, 0.8),
      hexToRGBA(theme.palette.warning.main, 0.8),
      hexToRGBA(theme.palette.info.main, 0.8)
    ],
    legend: {
      position: 'bottom',
      show: true,
      labels: {
        colors: theme.palette.text.disabled
      }
    }, // Aggiunta della legenda con posizione in basso
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          if (balanceview) {
            return fCurrency(parseFloat(val))
          }

          return '******'
        }
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 3, lineCap: 'round', colors: [theme.palette.background.paper] },
    labels: conti.map(conto => conto._id),
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        endAngle: 130,
        startAngle: -130,
        // customScale: 0.9,
        donut: {
          size: '80%',
          labels: {
            show: true,
            name: {
              offsetY: 25,
              fontSize: '1rem',
              color: theme.palette.text.secondary
            },
            value: {
              offsetY: -15,
              fontWeight: 500,
              fontSize: '2.125rem',
              color: theme.palette.text.primary,
              formatter: value => {
                if (balanceview) {
                  return `€${fShortenNumber(parseFloat(value))}`
                }

                return '******'
              }
            },
            total: {
              show: true,
              label: 'Totale',
              fontSize: '1rem',
              color: theme.palette.text.secondary,
              formatter: value => {
                if (balanceview) {
                  return fShortenNumber(value.globals.seriesTotals.reduce((total, num) => total + num))
                }

                return '******'
              }
            }
          }
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader
        title='Conti'
        action={
          <Button onClick={() => router.push('/conti')} size='small' startIcon={<Icon icon='gg:add' />}>
            Aggiungi
          </Button>
        }
      />
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 294 }}>
          <CircularProgress />
        </div>
      )}
      <CardContent>
        {!isLoading && conti.length === 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 294 }}>
            <Typography variant='subtitle1'>Non hai aggiunto nessun conto</Typography>
          </div>
        )}
        {!isLoading && conti.length > 0 && (
          <ReactApexcharts
            key={balanceview}
            type='donut'
            height={294}
            options={options}
            series={conti.map(conto => conto.balance)}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default ContiWidget
