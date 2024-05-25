import { Box, Card, CardContent, CardHeader, CircularProgress, Divider, Typography, useTheme } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import IconifyIcon from 'src/@core/components/icon'
import axiosInstance from 'src/utils/axios'
import { fCurrency, fPercent, fShortenNumber } from 'src/utils/format-number'
import { fDate } from 'src/utils/format-time'
import { dateOptions } from '../home/card-income-vs-expense'
import DateOptionsMenu from 'src/utils/date-options'

function calculateEarnings(currentValue, investedValue) {
  // Calculate percentage
  const percentage = ((currentValue - investedValue) / investedValue) * 100

  // Calculate amount
  const amount = currentValue - investedValue

  return { percentage, amount }
}

const TotalNetWorthCard = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentValue, setCurrentValue] = useState(0)
  const [investedValue, setInvestedValue] = useState(0)
  const theme = useTheme()
  const [selectedDateOption, setSelectedDateOption] = useState(dateOptions[0])

  const { percentage, amount } = calculateEarnings(currentValue, investedValue)

  const getData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.post('/investimenti/get-chart', { selectedDateOption })
      const { data } = response
      setData(data)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }, [selectedDateOption])

  const getLastInfos = async () => {
    try {
      const response = await axiosInstance.post('/investimenti/get-last-infos', { selectedDateOption })
      const { data } = response
      setCurrentValue(data[0])
      setInvestedValue(data[1])
    } catch (error) {}
  }

  useEffect(() => {
    getLastInfos()
    getData()
  }, [selectedDateOption])

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
                  <IconifyIcon icon='mdi:circle' fontSize='0.6rem' />
                  <Typography variant='body2'>{`${i.dataKey} : ${fCurrency(
                    parseFloat(i.payload[i.dataKey])
                  )}`}</Typography>
                </Box>
              )
            })}
        </Box>
      )
    }

    return null
  }

  return (
    <Card>
      <CardHeader
        title={
          <>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant='h6' sx={{ mr: 1.5 }}>
                  Valore corrente: {fCurrency(currentValue)}
                </Typography>
                <Typography variant='subtitle2' sx={{ color: amount > 0 ? 'success.main' : 'error.main' }}>
                  {amount > 0 && '+'}
                  {fPercent(percentage)} {amount > 0 && '+'}
                  {fCurrency(amount)}
                </Typography>
              </Box>
              <DateOptionsMenu
                iconProps={{ fontSize: 24 }}
                options={dateOptions}
                onChangeOption={option => setSelectedDateOption(option)}
                iconButtonProps={{ size: 'small', className: 'card-more-options', sx: { color: 'text.secondary' } }}
              />
            </Box>
            <Typography variant='body2' sx={{ mr: 1.5 }}>
              Valore investito: {fCurrency(investedValue)}
            </Typography>
          </>
        }
      />

      <CardContent>
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
            <CircularProgress />
          </div>
        )}
        {!isLoading && (
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer>
              <AreaChart height={350} data={data}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis tick={{ fontSize: 12 }} dataKey='name' tickFormatter={tick => fDate(tick)} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={tick => fShortenNumber(tick)} />
                <Tooltip content={CustomTooltip} />
                <Area dataKey='Investimenti' stackId='1' stroke='1' fill={theme.palette.warning.main} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default TotalNetWorthCard
