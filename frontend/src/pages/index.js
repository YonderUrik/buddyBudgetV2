import { Box, Grid } from '@mui/material'
import { useEffect, useState } from 'react'
import CardIncomeVsExpense from 'src/views/pages/home/card-income-vs-expense'
import ContiWidget from 'src/views/pages/home/conti-widget'
import ExpensePerCategory from 'src/views/pages/home/expense-per-category'
import NetWorthChart from 'src/views/pages/home/networth-chart'
import FastAddTransaction from 'src/views/pages/home/fast-add-transaction'

import LastsTransactions from 'src/views/pages/transactions/last-transactions'

const Home = () => {
  const balanceview = window.localStorage.getItem('balanceView') === 'true'
  const [balanceviewState, setBalanceviewState] = useState(balanceview)
  const [keyRefresh, setKeyRefresh] = useState(true)

  useEffect(() => {
    setBalanceviewState(balanceview)
  }, [balanceview])

  const onChangeShowBalance = () => {
    const tmpBalance = !balanceviewState
    setBalanceviewState(tmpBalance)
    window.localStorage.setItem('balanceView', tmpBalance)
  }

  const refreshAllData = () => {
    setKeyRefresh(!keyRefresh)
  }

  return (
    <Grid key={keyRefresh} container spacing={6}>
      <Grid item xs={12} md={12}>
        <Box
          gap={6}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }
          }}
        >
          <FastAddTransaction
            onChangeShowBalance={onChangeShowBalance}
            balanceview={balanceviewState}
            refreshAllData={refreshAllData}
          />
          <CardIncomeVsExpense balanceview={balanceviewState} />
        </Box>
      </Grid>
      <Grid item xs={12} md={12}>
        <Box
          gap={6}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' } // Proporzioni cambiate
          }}
        >
          <Box gridColumn={{ xs: 'span 1', md: 'span 2' }}>
            <ExpensePerCategory balanceview={balanceviewState} />
          </Box>
          <ContiWidget balanceview={balanceviewState} />
        </Box>
      </Grid>
      <Grid item xs={12} md={12}>
        <LastsTransactions balanceview={balanceviewState} refreshAllData={refreshAllData} />
      </Grid>
      <Grid item xs={12} md={12}>
        <NetWorthChart balanceview={balanceviewState} />
      </Grid>
    </Grid>
  )
}

export default Home
