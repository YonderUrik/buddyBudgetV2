import toast from 'react-hot-toast'
import { useState } from 'react'

import { Typography, Box, Card, CardHeader, Button, Popover, MenuItem } from '@mui/material'

import axios from 'src/utils/axios'
import DateOptionsMenu from 'src/utils/date-options'
import { dateOptions } from 'src/views/pages/home/card-income-vs-expense'
import Icon from 'src/@core/components/icon'
import TransactionTable from 'src/views/pages/transactions/transaction-table'

export const SORT_OPTIONS = [
  { value: -1, label: 'Più recenti', field: 'date' },
  { value: 1, label: 'Meno recenti', field: 'date' },
  { value: 1, label: 'Importo (crescente)', field: 'amount' },
  { value: -1, label: 'Importo (decrescente)', field: 'amount' }
]

const Transazioni = () => {
  const [anchorEl, setAnchorEl] = useState(null)

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
    sort: { date: -1 },
    filter: [],
    selectedDateOption: dateOptions[0]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [dataList, setDataList] = useState([])
  const [dataCount, setDataCount] = useState(0)

  const getDataList = async newPaginationModel => {
    try {
      setIsLoading(true)

      const response = await axios.post('/transazioni/get-transactions', {
        page: newPaginationModel.page + 1,
        pageSize: newPaginationModel.pageSize,
        sort: newPaginationModel.sort,
        filter: newPaginationModel.filter,
        selectedDateOption: newPaginationModel.selectedDateOption
      })
      const { data } = response
      setDataList(data[0])
      setDataCount(data[1])
    } catch (error) {
      toast.error(error.message || error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectedDateOptionChange = option => {
    const oldPagination = paginationModel
    oldPagination.selectedDateOption = option
    getDataList(oldPagination)
  }

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant='h6'>
            Transazioni <b>{paginationModel.selectedDateOption}</b>
          </Typography>
        }
        action={
          <>
            <Button
              disableRipple
              color='inherit'
              onClick={event => setAnchorEl(event.currentTarget)}
              endIcon={<Icon icon={Boolean(anchorEl) ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} />}
              sx={{ fontWeight: 'fontWeightSemiBold', textTransform: 'capitalize' }}
            >
              Ordina per:
              <Box component='span' sx={{ ml: 0.5, fontWeight: 'fontWeightBold' }}>
                {
                  SORT_OPTIONS.find(
                    sort =>
                      Object.keys(paginationModel.sort)[0] === sort.field &&
                      paginationModel.sort[Object.keys(paginationModel.sort)[0]] === sort.value
                  ).label
                }
              </Box>
            </Button>

            <Popover
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              sx={{ width: '100%' }}
            >
              {SORT_OPTIONS.map(option => (
                <MenuItem
                  key={`${option.field}-${option.value}`}
                  selected={
                    Object.keys(paginationModel.sort)[0] === option.field &&
                    paginationModel.sort[Object.keys(paginationModel.sort)[0]] === option.value
                  }
                  onClick={() => {
                    setAnchorEl(null)
                    const oldPagination = paginationModel
                    oldPagination.sort = {}
                    oldPagination.sort[option.field] = option.value
                    setPaginationModel(oldPagination)
                    getDataList(oldPagination)
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Popover>
            <DateOptionsMenu
              iconProps={{ fontSize: 24 }}
              options={dateOptions}
              onChangeOption={option => {
                handleSelectedDateOptionChange(option)
              }}
              iconButtonProps={{ size: 'small', className: 'card-more-options', sx: { color: 'text.secondary' } }}
            />
          </>
        }
      />
      {/* TABLEs */}
      <TransactionTable
        paginationModel={paginationModel}
        setPaginationModel={pagination => setPaginationModel(pagination)}
        getDataList={pagination => getDataList(pagination)}
        isLoading={isLoading}
        dataList={dataList}
        dataCount={dataCount}
      />
    </Card>
  )
}

export default Transazioni
