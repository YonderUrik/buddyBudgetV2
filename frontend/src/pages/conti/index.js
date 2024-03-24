import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Avatar, Box, Card, CardHeader, Tab, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import Icon from 'src/@core/components/icon'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import axios from 'src/utils/axios'
import { fCurrency } from 'src/utils/format-number'
import AddNewBank from 'src/views/pages/conti/add-new-bank'
import BankInfo from 'src/views/pages/conti/bank-info'

const Conti = () => {
  const RenderTabAvatar = ({ data }) => (
    <Avatar
      variant='rounded'
      sx={{
        width: 130,
        height: 122,
        backgroundColor: 'transparent',
        border: theme =>
          contoSelected === data._id ? `2px solid ${theme.palette.primary.main}` : `2px dashed ${theme.palette.divider}`
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <Icon width={34} icon='mdi:bank-outline' />
        <Typography variant='h6' sx={{ mt: 2, fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}>
          {data._id}
        </Typography>
        <Typography variant='body2' sx={{ mt: 2, fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}>
          {fCurrency(data.balance)}
        </Typography>
      </Box>
    </Avatar>
  )

  const [contiList, setContiList] = useState([])
  const [contoSelected, setcontoSelected] = useState(contiList[0] || 'addBank')

  const handleChange = (event, newValue) => {
    setcontoSelected(newValue)
  }

  const getContiSummary = useCallback(async () => {
    const response = await axios.post('/home/get-conti-summary', {})
    const { data } = response
    setContiList(data)
    if (data.length > 0) {
      setcontoSelected(data[0]._id)
    }
  }, [])

  useEffect(() => {
    getContiSummary()
  }, [getContiSummary])

  const refreshData = () => {
    getContiSummary()
  }

  return (
    <Card>
      <CardHeader title='Conti' />
      <TabContext value={contoSelected}>
        <TabList
          variant='scrollable'
          scrollButtons='auto'
          onChange={handleChange}
          sx={{
            mb: 2.5,
            px: 5,
            '& .MuiTab-root:not(:last-child)': { mr: 4 },
            '& .MuiTabs-indicator': { display: 'none' }
          }}
        >
          {contiList.map(conto => (
            <Tab key={conto._id} value={conto._id} sx={{ p: 0 }} label={<RenderTabAvatar data={conto} />} />
          ))}
          <Tab
            value='addBank'
            sx={{ p: 0 }}
            label={
              <Avatar
                variant='rounded'
                sx={{
                  width: 130,
                  height: 122,
                  backgroundColor: 'transparent',
                  border: theme =>
                    contoSelected === 'addBank'
                      ? `2px solid ${theme.palette.primary.main}`
                      : `2px dashed ${theme.palette.divider}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      display: 'flex',
                      borderRadius: '8px',
                      alignItems: 'center',
                      color: 'action.active',
                      justifyContent: 'center',
                      backgroundColor: theme => hexToRGBA(theme.palette.secondary.main, 0.12)
                    }}
                  >
                    <Icon icon='mdi:plus' />
                  </Box>
                  <Typography
                    variant='body2'
                    sx={{ mt: 2, fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}
                  >
                    Aggiungi conto
                  </Typography>
                </Box>
              </Avatar>
            }
          />
        </TabList>
        <TabPanel sx={{ p: 0, mb: 2.5 }} value={contoSelected}>
          {contoSelected === 'addBank' ? (
            <AddNewBank refreshData={refreshData} />
          ) : (
            <BankInfo key={contoSelected} bankName={contoSelected} />
          )}
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default Conti
