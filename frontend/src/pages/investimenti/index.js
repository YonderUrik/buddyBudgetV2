import { Grid } from '@mui/material'
import AddInvestmentTransaction from 'src/views/pages/investimenti/add-investment-transactions'
import TotalNetworthCard from 'src/views/pages/investimenti/total-networth-card'

const Investimenti = () => {
  return (
    <Grid container spacing={4} className='match-height'>
      <Grid item justify='flex-end'>
        <AddInvestmentTransaction />
      </Grid>
      <Grid item xs={12} sm={12} md={12}>
        <TotalNetworthCard />
      </Grid>
    </Grid>
  )
}
export default Investimenti
