// ** MUI Imports
import toast from 'react-hot-toast'
import { useCallback, useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import TableContainer from '@mui/material/TableContainer'

import axios from 'src/utils/axios'
import { fDate } from 'src/utils/format-time'
import { fCurrency } from 'src/utils/format-number'

import DeleteTransaction from './delete-transaction'
import EditTransactionDrawer from './edit-transaction'
import { useRouter } from 'next/router'
import { Button, Skeleton } from '@mui/material'
import Icon from 'src/@core/components/icon'

const LastsTransactions = props => {
  const { refreshAllData, balanceview } = props
  const [dataList, setDataList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState({})
  const router = useRouter()

  const getDataList = useCallback(async () => {
    try {
      const response = await axios.post('/transazioni/get-last-transactions', {})
      const { data } = response
      setDataList(data)
    } catch (error) {
      toast.error(error.message || error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('/home/get-categories')
      const { data } = response
      setCategories(data)
    } catch (error) {
      toast.error(error.message || error)
    }
  }, [])

  useEffect(() => {
    getCategories()
    getDataList()
  }, [getDataList, getCategories])

  return (
    <Card>
      <CardHeader
        title='Ultime transazioni'
        titleTypographyProps={{ sx: { lineHeight: '2rem !important', letterSpacing: '0.15px !important' } }}
        action={
          <Button
            variant='outlined'
            onClick={() => router.push('/transazioni')}
            size='small'
            endIcon={<Icon icon='ic:outline-keyboard-arrow-right' />}
          >
            Transazioni
          </Button>
        }
      />
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
          {isLoading || (categories && Object.keys(categories).length === 0) ? (
            <TableBody>
              {[...Array(10)].map((_, index) => (
                <TableRow key={index}>
                  {[...Array(6)].map((_, index_under) => (
                    <TableCell key={index_under}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              {dataList.map((row, index) => {
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
                          <DeleteTransaction refreshAllData={refreshAllData} _id={_id} />
                          <EditTransactionDrawer refreshAllData={refreshAllData} row={row} categories={categories} />
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
                          {operatorAmount} {balanceview ? fCurrency(amount) : '******'}
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
              })}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Card>
  )
}

export default LastsTransactions
