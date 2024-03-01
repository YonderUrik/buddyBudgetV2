import toast from 'react-hot-toast'
import { useCallback, useEffect, useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
  Box,
  Card,
  CardHeader,
  Skeleton,
  Button,
  Popover,
  MenuItem
} from '@mui/material'

import axios from 'src/utils/axios'
import DeleteTransaction from 'src/views/pages/transactions/delete-transaction'
import EditTransactionDrawer from 'src/views/pages/transactions/edit-transaction'
import { fDate } from 'src/utils/format-time'
import { fCurrency } from 'src/utils/format-number'
import DateOptionsMenu from 'src/utils/date-options'
import { dateOptions } from 'src/views/pages/home/card-income-vs-expense'
import Icon from 'src/@core/components/icon'

export const SORT_OPTIONS = [
  { value: -1, label: 'Più recenti', field: 'date' },
  { value: 1, label: 'Meno recenti', field: 'date' },
  { value: 1, label: 'Importo (crescente)', field: 'amount' },
  { value: -1, label: 'Importo (decrescente)', field: 'amount' }
]

const Transazioni = () => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState(null)
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
    sort: { date: -1 },
    filter: [],
    selectedDateOption: dateOptions[0]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [dataList, setDataList] = useState([])
  const [dataCount, setDataCount] = useState(40)

  const getCategories = useCallback(async () => {
    try {
      const response = await axios.get('/home/get-categories')
      const { data } = response
      setCategories(data)
    } catch (error) {
      toast.error(error.message || error)
    }
  }, [])

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

  const handlePageChange = (event, newPage) => {
    const oldPagination = paginationModel
    oldPagination.page = newPage
    setPaginationModel(oldPagination)

    getDataList(oldPagination)
  }

  const handleChangePageSize = event => {
    const oldPagination = paginationModel

    oldPagination.pageSize = parseInt(event.target.value, 10)
    oldPagination.page = 0

    setPaginationModel(oldPagination)
    getDataList(oldPagination)
  }

  const handleSelectedDateOptionChange = option => {
    const oldPagination = paginationModel
    oldPagination.selectedDateOption = option
    getDataList(oldPagination)
  }

  useEffect(() => {
    getCategories()
  }, [getCategories])

  useEffect(() => {
    getDataList(paginationModel)
  }, [getCategories, paginationModel])

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
                    // onSort(option.value)
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
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-root': { py: theme => `${theme.spacing(2.5)} !important` } }}>
              <TableCell>
                <Typography variant='subtitle2' sx={{ textTransform: 'capitalize' }}>
                  Azioni
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant='subtitle2' sx={{ textTransform: 'capitalize' }}>
                  Conto
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant='subtitle2' sx={{ textTransform: 'capitalize' }}>
                  Data
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='subtitle2' sx={{ textTransform: 'capitalize' }}>
                  Importo
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='subtitle2' sx={{ textTransform: 'capitalize' }}>
                  Categoria
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='subtitle2' sx={{ textTransform: 'capitalize' }}>
                  Note
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading || Object.keys(categories).length === 0 ? (
              <>
                {[...Array(paginationModel.pageSize)].map((_, index) => (
                  <TableRow
                    key={index}
                    sx={{ '& .MuiTableCell-root': { py: theme => `${theme.spacing(3.3)} !important` } }}
                  >
                    {[...Array(6)].map((_, index_under) => (
                      <TableCell key={index_under}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : (
              dataList.map((row, index) => {
                let colorTransaction = ''
                let operatorAmount = ''
                let importoType = ''
                const { _id, date, amount, type, cardName, cardNameTo, categoryId, subCategoryId, note } = row

                let categoryObject = {}
                let subcategory = {}

                if (type !== 'transfer') {
                  categoryObject = categories[type].find(item => item.category_id === categoryId)
                  subcategory = categoryObject.subcategories.find(sub => sub.subcategory_id === subCategoryId)
                }

                if (type === 'out') {
                  colorTransaction = 'error.main'
                  operatorAmount = '-'
                  importoType = 'Uscita'
                } else if (type === 'in') {
                  colorTransaction = 'success.main'
                  operatorAmount = '+'
                  importoType = 'Entrata'
                } else if (type === 'transfer') {
                  colorTransaction = 'info.main'
                  importoType = 'Transferimento'
                }

                return (
                  <TableRow
                    hover
                    key={index}
                    sx={{ '& .MuiTableCell-root': { py: theme => `${theme.spacing(1)} !important` } }}
                  >
                    {/* ACTIONS */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex' }}>
                          <DeleteTransaction refreshAllData={() => getDataList(paginationModel)} _id={_id} />
                          <EditTransactionDrawer
                            refreshAllData={() => getDataList(paginationModel)}
                            row={row}
                            categories={categories}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    {/* CONTO */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant='body' sx={{ color: 'text.primary' }}>
                            da <b>{cardName}</b>
                          </Typography>
                          {cardNameTo && (
                            <Typography variant='caption' sx={{ whiteSpace: 'nowrap' }}>
                              a <b>{cardNameTo}</b>
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    {/* DATA */}
                    <TableCell>
                      <Typography variant='caption'>{fDate(`${date} UTC`)}</Typography>
                    </TableCell>
                    {/* IMPORTO */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600, color: colorTransaction }}>
                          {operatorAmount}
                          {fCurrency(amount)}
                        </Typography>
                        <Typography variant='caption'>{importoType}</Typography>
                      </Box>
                    </TableCell>
                    {/* CATEGORIA */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {categoryObject.category_name}
                        </Typography>
                        <Typography variant='caption'>{subcategory.subcategory_name}</Typography>
                      </Box>
                    </TableCell>
                    {/* NOTE */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant='caption'>{note}</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[25, 50, 100]}
                colSpan={6}
                count={dataCount}
                rowsPerPage={paginationModel.pageSize}
                page={paginationModel.page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleChangePageSize}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default Transazioni
