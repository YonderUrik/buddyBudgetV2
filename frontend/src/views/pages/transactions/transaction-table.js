import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'src/utils/axios'
import DeleteTransaction from './delete-transaction'
import EditTransactionDrawer from './edit-transaction'
import { fDate } from 'src/utils/format-time'
import { fCurrency } from 'src/utils/format-number'

const TransactionTable = props => {
  const { paginationModel, setPaginationModel, getDataList, isLoading, dataList, dataCount } = props

  const [categories, setCategories] = useState([])

  const getCategories = useCallback(async () => {
    try {
      const response = await axios.get('/home/get-categories')
      const { data } = response
      setCategories(data)
    } catch (error) {
      toast.error(error.message || error)
    }
  }, [])

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

  useEffect(() => {
    getCategories()
  }, [getCategories])

  useEffect(() => {
    getDataList(paginationModel)
  }, [getCategories, paginationModel])

  return (
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
            dataList.length > 0 &&
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
  )
}

export default TransactionTable
