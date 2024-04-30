import { Grid } from '@mui/material'
import { useState } from 'react'
import AddInvestmentTransaction from 'src/views/pages/investimenti/add-investment-transactions'
import AllocationChart from 'src/views/pages/investimenti/allocation-chart'
import PositionTable from 'src/views/pages/investimenti/position-table'
import TotalNetworthCard from 'src/views/pages/investimenti/total-networth-card'

const Investimenti = () => {
  const [key, setKey] = useState(true)

  return (
    <Grid container spacing={4} className='match-height'>
      <Grid item xs={12} sm={12} md={12} justify='flex-end'>
        <AddInvestmentTransaction refreshAll={() => setKey(prev => !prev)} />
      </Grid>
      <Grid item xs={12} sm={8} md={8}>
        <TotalNetworthCard key={key} />
      </Grid>
      <Grid item xs={12} sm={4} md={4}>
        <AllocationChart key={key} />
      </Grid>
      <Grid item xs={12} sm={12} md={12}>
        <PositionTable key={key} />
      </Grid>
    </Grid>
  )
}

export default Investimenti
