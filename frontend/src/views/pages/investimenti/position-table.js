import { useEffect, useState } from 'react'
import IconifyIcon from 'src/@core/components/icon'
import axiosInstance from 'src/utils/axios'
import { fCurrency, fPercent } from 'src/utils/format-number'

const {
  Card,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableBody,
  IconButton,
  ListItemText,
  Typography,
  TableSortLabel,
  Box
} = require('@mui/material')

const PositionTable = () => {
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortCriteria, setSortCriteria] = useState('lastBalance') // Default sorting column
  const [sortOrder, setSortOrder] = useState('desc') // Default sorting order

  // Function to handle sorting
  const handleSort = criteria => {
    // If the same column is clicked again, toggle sorting order
    const isAscending = sortCriteria === criteria && sortOrder === 'asc'
    const newSortOrder = isAscending ? 'desc' : 'asc'

    // Sort the rows based on the selected column and sorting order
    const sortedRows = [...rows].sort((a, b) => {
      if (a[criteria] < b[criteria]) return isAscending ? -1 : 1
      if (a[criteria] > b[criteria]) return isAscending ? 1 : -1

      return 0
    })

    setRows(sortedRows)
    setSortCriteria(criteria)
    setSortOrder(newSortOrder)
  }

  const getRows = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.post('/investimenti/get-positions-data', {})
      const { data } = response

      const isAscending = sortOrder === 'asc'

      // Sort the rows based on the selected column and sorting order
      const sortedRows = data.sort((a, b) => {
        if (a.lastBalance < b.lastBalance) return isAscending ? -1 : 1
        if (a.lastBalance > b.lastBalance) return isAscending ? 1 : -1

        return 0
      })

      setRows(sortedRows)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getRows()
  }, [])

  return (
    <Card>
      <TableContainer component={Paper}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              {/* TITLE */}
              <TableCell style={{ cursor: 'pointer' }}>
                <TableSortLabel
                  active={sortCriteria === 'longname'}
                  direction={sortCriteria === 'longname' ? sortOrder : 'asc'}
                  onClick={() => handleSort('longname')}
                >
                  Titolo
                </TableSortLabel>
              </TableCell>
              {/* TOTAL INVESTED */}
              <TableCell align='right' style={{ cursor: 'pointer' }}>
                <TableSortLabel
                  active={sortCriteria === 'totalInvested'}
                  direction={sortCriteria === 'totalInvested' ? sortOrder : 'asc'}
                  onClick={() => handleSort('totalInvested')}
                >
                  Prezzo di acquisto
                </TableSortLabel>
              </TableCell>
              {/* LAST BALANCE */}
              <TableCell align='right' style={{ cursor: 'pointer' }}>
                <TableSortLabel
                  active={sortCriteria === 'lastBalance'}
                  direction={sortCriteria === 'lastBalance' ? sortOrder : 'asc'}
                  onClick={() => handleSort('lastBalance')}
                >
                  Posizione
                </TableSortLabel>
              </TableCell>
              {/* PROFIT */}
              <TableCell align='right' style={{ cursor: 'pointer' }}>
                Profitto
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <Row key={index} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default PositionTable

function Row(props) {
  const { row } = props

  const is_profit = row.lastBalance - row.totalInvested > 0

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell component='th' scope='row'>
          <ListItemText
            sx={{ p: 0, m: 0 }}
            primary={<Typography variant='body'>{row.longname}</Typography>}
            secondary={<Typography variant='body2'>{`${row.symbol} - x${row.quantity}`}</Typography>}
          />
        </TableCell>
        <TableCell align='right'>
          <ListItemText
            sx={{ p: 0, m: 0 }}
            primary={<Typography variant='body'>{fCurrency(row.totalInvested)}</Typography>}
            secondary={<Typography variant='body2'>{fCurrency(row.totalInvested / row.quantity)}</Typography>}
          />
        </TableCell>
        <TableCell align='right'>
          <ListItemText
            sx={{ p: 0, m: 0 }}
            primary={<Typography variant='body'>{fCurrency(row.lastBalance)}</Typography>}
            secondary={<Typography variant='body2'>{fCurrency(row.lastBalance / row.quantity)}</Typography>}
          />
        </TableCell>
        <TableCell align='right'>
          <ListItemText
            sx={{ p: 0, m: 0 }}
            primary={
              <Typography color={is_profit ? 'success.main' : 'error.main'} variant='body'>
                {is_profit && '+'}
                {fCurrency(row.lastBalance - row.totalInvested)}
              </Typography>
            }
            secondary={
              <Typography color={is_profit ? 'success.main' : 'error.main'} variant='body2'>
                {is_profit && '+'}
                {fPercent(((row.lastBalance - row.totalInvested) / row.totalInvested) * 100)}
              </Typography>
            }
          />
        </TableCell>
      </TableRow>
    </>
  )
}
