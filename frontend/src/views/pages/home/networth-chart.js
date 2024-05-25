// ** React Imports
import { useCallback, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import axios from 'src/utils/axios'
import toast from 'react-hot-toast'
import { fCurrency, fShortenNumber } from 'src/utils/format-number'
import { CircularProgress, useTheme } from '@mui/material'
import { dateOptions } from './card-income-vs-expense'
import DateOptionsMenu from 'src/utils/date-options'
import { fDate } from 'src/utils/format-time'

const NetWorthChart = props => {
  // Funzione per generare una scala di colori in base al colore primario e al numero di banche distinte
  const generateColorScale = (primaryColor, numberOfDistinctBanks) => {
    const primaryRGB = primaryColor.match(/\w\w/g).map(hex => parseInt(hex, 16))

    // Calcola la gradazione del colore in base al numero di banche distinte
    const step = 1 / (numberOfDistinctBanks + 3)
    const colors = []

    // Genera i colori della scala
    for (let i = 0; i < numberOfDistinctBanks; i++) {
      const color = `rgba(${primaryRGB[0]}, ${primaryRGB[1]}, ${primaryRGB[2]}, ${1 - i * step})`
      colors.push(color)
    }

    return colors
  }

  const CustomTooltip = data => {
    const { active, payload } = data
    if (active && payload) {
      return (
        <Box sx={{ p: 2, bgcolor: 'background.paper', border: 0, borderRadius: 1 }} className='recharts-custom-tooltip'>
          <Typography>{data.label}</Typography>
          <Divider />
          {data &&
            data.payload &&
            data.payload.map(i => {
              return (
                <Box
                  sx={{ display: 'flex', alignItems: 'center', '& svg': { color: i.fill, mr: 2.5 } }}
                  key={i.dataKey}
                >
                  <Icon icon='mdi:circle' fontSize='0.6rem' />
                  <Typography variant='body2'>{`${i.dataKey} : ${
                    balanceview ? fCurrency(parseFloat(i.payload[i.dataKey])) : '******'
                  }`}</Typography>
                </Box>
              )
            })}
        </Box>
      )
    }

    return null
  }

  // ** States
  const { balanceview, bankName, hideCard, onlyBanks } = props

  const [chartData, setChartData] = useState([])
  const [distinctBanks, setDistinctBanks] = useState([])
  const [selectedDateOption, setSelectedDateOption] = useState(dateOptions[5])
  const [isLoading, setIsLoading] = useState(false)

  const theme = useTheme()

  const getData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.post('/home/get-networth-by-time', { selectedDateOption, bankName })
      const { data } = response
      setDistinctBanks(data[1])

      const responseInvestment = await axios.post('/investimenti/get-chart', { selectedDateOption })

      if (!onlyBanks) {
        const mergedArray = responseInvestment.data.map(item1 => {
          const item2 = data[0].find(item => item.name === item1.name)

          return { ...item1, ...item2 }
        })
        setChartData(mergedArray)
      }else{
        setChartData(data[0])
      }
      // Merge arrays based on the 'date' key

    } catch (error) {
      toast.error(error.message || error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedDateOption])

  useEffect(() => {
    getData()
  }, [getData])

  const colorScale = generateColorScale(theme.palette.primary.dark, distinctBanks.length)

  return (
    <Card sx={{ boxShadow: hideCard ? 0 : 6 }}>
      <CardHeader
        title={
          <Typography variant='subtitle'>
            Il tuo patrimonio totale <b>{selectedDateOption}</b>
          </Typography>
        }
        action={
          <DateOptionsMenu
            iconProps={{ fontSize: 24 }}
            options={dateOptions}
            onChangeOption={option => setSelectedDateOption(option)}
            iconButtonProps={{ size: 'small', className: 'card-more-options', sx: { color: 'text.secondary' } }}
          />
        }
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          '& .MuiCardHeader-action': { mb: 0 },
          '& .MuiCardHeader-content': { mb: [2, 0] }
        }}
      />
      <CardContent>
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
            <CircularProgress />
          </div>
        )}
        {!isLoading && chartData.length === 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
            <Typography>Nessun dato per il patrimonio nel corso del tempo</Typography>
          </div>
        )}
        {!isLoading && chartData.length > 0 && (
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer>
              <AreaChart height={350} data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis tick={{ fontSize: 12 }} dataKey='name' tickFormatter={tick => fDate(tick)} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={!balanceview ? () => '*' : fShortenNumber} />
                <Tooltip content={CustomTooltip} />
                {distinctBanks.map((bank, index) => (
                  <Area key={bank} dataKey={bank} stackId='1' stroke='1' fill={colorScale[index]} />
                ))}
                <Area dataKey='Investimenti' stackId='1' stroke='1' fill={theme.palette.warning.main} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default NetWorthChart
