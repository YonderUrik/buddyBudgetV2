import { useState } from 'react'
import { dateOptions } from '../home/card-income-vs-expense'
import TransactionTable from '../transactions/transaction-table'
import toast from 'react-hot-toast'
import { Box, Button, MenuItem, Popover } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { SORT_OPTIONS } from 'src/pages/transazioni'
import DateOptionsMenu from 'src/utils/date-options'
import axiosInstance from 'src/utils/axios'
import { useAuth0 } from '@auth0/auth0-react'

const BankInfo = props => {
  const { bankName } = props
  const [anchorEl, setAnchorEl] = useState(null)

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
    sort: { date: -1 },
    filter: [{ field: 'cardName', value: bankName, operator: 'equals', logicOperator: 'and' }],
    selectedDateOption: dateOptions[0]
  })

  const [isLoading, setIsLoading] = useState(false)
  const [dataList, setDataList] = useState([])
  const [dataCount, setDataCount] = useState(0)

  const auth = useAuth0()

  const getDataList = async newPaginationModel => {
    try {
      setIsLoading(true)
      const token = await auth.getAccessTokenSilently()

      const response = await axiosInstance.post(
        '/transazioni/get-transactions',
        {
          page: newPaginationModel.page + 1,
          pageSize: newPaginationModel.pageSize,
          sort: newPaginationModel.sort,
          filter: newPaginationModel.filter,
          selectedDateOption: newPaginationModel.selectedDateOption
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      const { data } = response
      setDataList(data[0])
      setDataCount(data[1])
    } catch (error) {
      console.error(error)
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
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mr: 6 }}>
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

        <Popover anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} sx={{ width: '100%' }}>
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
      </Box>
      <TransactionTable
        key={bankName}
        paginationModel={paginationModel}
        setPaginationModel={pagination => setPaginationModel(pagination)}
        getDataList={pagination => getDataList(pagination)}
        isLoading={isLoading}
        dataList={dataList}
        dataCount={dataCount}
      />
    </>
  )
}

export default BankInfo
