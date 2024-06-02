// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Component Import
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { useEffect, useState } from 'react'
import axiosInstance from 'src/utils/axios'
import { CircularProgress, Tab, Tabs } from '@mui/material'
import { fCurrency } from 'src/utils/format-number'
import { useAuth0 } from '@auth0/auth0-react'

const AllocationChart = () => {
  // ** Hook
  const theme = useTheme()

  const [allocazioneInfo, setAllocazioneInfo] = useState([])
  const [isLoading, setIsLoading] = useState([])
  const [selectedTab, setSelectedTab] = useState('Tipo')

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
  }

  const auth = useAuth0()

  const getAllocazione = async () => {
    try {
      setIsLoading(true)
      const token = await auth.getAccessTokenSilently()

      const response = await axiosInstance.post(
        '/investimenti/get-allocation-infos',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      const { data } = response

      setAllocazioneInfo(data)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const getChartData = () => {
    if (selectedTab === 'Tipo') {
      // Raggruppa i dati per "type" e somma i valori di lastBalance
      const seriesData = allocazioneInfo.reduce((acc, curr) => {
        const index = acc.findIndex(item => item.name === curr.type)
        if (index !== -1) {
          acc[index].data += curr.lastBalance
        } else {
          acc.push({ name: curr.type, data: curr.lastBalance })
        }

        return acc
      }, [])

      return seriesData.map(data => data.data)
    } else if (selectedTab === 'Posizioni') {
      // Altrimenti, utilizza i dati grezzi per il grafico
      return allocazioneInfo.map(curr => curr.lastBalance)
    }
  }

  const getChartLabels = () => {
    if (selectedTab === 'Tipo') {
      // Usa i nomi dei tipi come etichette se è selezionata la tab "Tipo"
      const distinctTypes = new Set(allocazioneInfo.map(info => info.type))

      return Array.from(distinctTypes) // Converti il Set in un array
    } else if (selectedTab === 'Posizioni') {
      // Altrimenti, usa un'etichetta generica
      return allocazioneInfo.map(info => info.shortname)
    }
  }

  useEffect(() => {
    getAllocazione()
  }, [])

  const options = {
    stroke: { width: 0 },
    labels: getChartLabels(),
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: true,
        opacity: 0
      }
    },
    legend: {
      show: false
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,

            name: {
              fontSize: '0.9rem'
            },
            value: {
              fontSize: '1.2rem',
              color: theme.palette.text.secondary,
              formatter: val => `${fCurrency(parseInt(val, 10))}`
            }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return fCurrency(value)
        }
      }
    },
    responsive: [
      {
        breakpoint: 992,
        options: {
          chart: {
            height: 350
          },
          legend: {
            position: 'bottom'
          }
        }
      },
      {
        breakpoint: 576,
        options: {
          chart: {
            height: 300
          },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  name: {
                    fontSize: '1rem'
                  },
                  value: {
                    fontSize: '1rem'
                  },
                  total: {
                    fontSize: '1rem'
                  }
                }
              }
            }
          }
        }
      }
    ]
  }

  const series = getChartData()

  return (
    <Card>
      <CardHeader
        title='Allocazione'
        subheader={
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab value='Tipo' label='Tipo' />
            <Tab value='Posizioni' label='Posizioni' />
          </Tabs>
        }
        subheaderTypographyProps={{ sx: { color: theme => `${theme.palette.text.disabled} !important` } }}
      />
      <CardContent>
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
            <CircularProgress />
          </div>
        )}
        {!isLoading && (
          <ReactApexcharts key={selectedTab} type='donut' height={330} options={options} series={series} />
        )}
      </CardContent>
    </Card>
  )
}

export default AllocationChart
