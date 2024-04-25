import { Box, Card, CardContent, CardHeader, Grid, Tooltip, Typography } from '@mui/material'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const TotalNetWorthCard = () => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant='h6' sx={{ mr: 1.5 }}>
            €27.9k
          </Typography>
          <Typography variant='subtitle2' sx={{ color: 'success.main' }}>
            +16%
          </Typography>
        </Box>
        <Typography variant='body2'>Investimenti</Typography>

        <Grid item xs={12}>
          <RechartsLineChart />
        </Grid>
      </CardContent>
    </Card>
  )
}

export default TotalNetWorthCard

const RechartsLineChart = () => {
  const data = [
    { pv: 280, name: '7/12' },
    { pv: 200, name: '8/12' },
    { pv: 220, name: '9/12' },
    { pv: 180, name: '10/12' },
    { pv: 270, name: '11/12' },
    { pv: 250, name: '12/12' },
    { pv: 70, name: '13/12' },
    { pv: 90, name: '14/12' },
    { pv: 200, name: '15/12' },
    { pv: 150, name: '16/12' },
    { pv: 160, name: '17/12' },
    { pv: 100, name: '18/12' },
    { pv: 150, name: '19/12' },
    { pv: 100, name: '20/12' },
    { pv: 50, name: '21/12' }
  ]
  return (
    <CardContent>
      <Box sx={{ height: 350 }}>
        <ResponsiveContainer>
          <LineChart height={350} data={data}>
            <CartesianGrid />
            <XAxis dataKey='name' />
            <YAxis />
            <Line dataKey='pv' stroke='#ff9f43' strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  )
}
