import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
  styled
} from '@mui/material'
import { useEffect, useState } from 'react'
import IconifyIcon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import axiosInstance from 'src/utils/axios'
import { LoadingButton } from '@mui/lab'
import { DatePicker } from '@mui/x-date-pickers'
import { GridExpandMoreIcon } from '@mui/x-data-grid'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default
}))

const AddInvestmentTransaction = props => {
  const { refreshAll } = props
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [quotes, setQuotes] = useState([])
  const [ownQuotes, setOwnQuotes] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)

  const handleClose = () => {
    setOpen(false)
    setQuotes([])
    reset()
  }

  const schema = yup.object().shape({ symbol: yup.string().required('Inserisci un valore') })
  const defaultValues = { symbol: '' }

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const getMyQuotes = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.post('/investimenti/get-my-stock', {})
      const { data } = response
      setOwnQuotes(data)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getMyQuotes()
  }, [])

  const onSubmit = async newData => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.post('/investimenti/search', newData)
      const { data } = response
      setQuotes(data.quotes)
    } catch (error) {
      toast.error(error.message || error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} startIcon={<IconifyIcon icon='material-symbols:add' />} variant='contained'>
        Aggiungi Transazione
      </Button>
      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={handleClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 420 } } }}
      >
        <Header>
          <Typography variant='h6'>
            <Stack direction='row' alignItems='center'>
              Aggiungi transazione {isLoading && <CircularProgress sx={{ ml: 2 }} size={18} />}
            </Stack>
          </Typography>
          <IconButton size='small' onClick={handleClose} sx={{ color: 'text.primary' }}>
            <IconifyIcon icon='mdi:close' fontSize={20} />
          </IconButton>
        </Header>
        <Box sx={{ p: 5 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl fullWidth sx={{ mb: 5 }}>
              <Controller
                name='symbol'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Stack sx={{ mt: 5 }}>
                    <OutlinedInput
                      value={value}
                      placeholder='ISIN, Simbolo, azione, ETF, Crypto ...'
                      onChange={onChange}
                      error={Boolean(errors.symbol)}
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton edge='end' type='submit'>
                            <IconifyIcon icon='material-symbols:search' fontSize={20} />
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {errors.symbol && (
                      <FormHelperText sx={{ color: 'error.main' }} id=''>
                        {errors.symbol.message}
                      </FormHelperText>
                    )}
                  </Stack>
                )}
              />
            </FormControl>
          </form>
          <List>
            {ownQuotes.length > 0 && (
              <Accordion sx={{ bgcolor: 'background.default', boxShadow: 0, mb: 3 }} defaultExpanded>
                <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
                  <Typography variant='body1' sx={{ mb: 1 }}>
                    <Stack direction='row' alignItems='center'>
                      Le tue posizioni
                    </Stack>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {ownQuotes.map(quote => (
                    <ListItem
                      sx={{ border: 1, borderRadius: 1, borderColor: 'text.disabled', mb: 2 }}
                      key={quote.symbol}
                      secondaryAction={
                        <IconButton onClick={() => setSelectedStock(quote)} edge='end' aria-label='delete'>
                          <IconifyIcon icon='ic:outline-keyboard-arrow-right' />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`${quote?.longname || quote?.shortname}`}
                        secondary={`${quote?.symbol} - ${quote?.quoteType} - ${quote?.exchDisp}`}
                      />
                    </ListItem>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}
            {quotes.length > 0 && (
              <Typography variant='body1' sx={{ mb: 1 }}>
                <Stack direction='row' alignItems='center'>
                  Risultati trovati
                </Stack>
              </Typography>
            )}
            {quotes.map(quote => (
              <ListItem
                sx={{ border: 1, borderRadius: 1, borderColor: 'text.disabled', mb: 2 }}
                key={quote.symbol}
                secondaryAction={
                  <IconButton onClick={() => setSelectedStock(quote)} edge='end' aria-label='delete'>
                    <IconifyIcon icon='ic:outline-keyboard-arrow-right' />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${quote?.longname || quote?.shortname}`}
                  secondary={`${quote?.symbol} - ${quote?.quoteType} - ${quote?.exchDisp}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      {selectedStock !== null && (
        <AddStockInfo
          stockInfo={selectedStock}
          handleClose={() => {
            setSelectedStock(null)
            getMyQuotes()
            reset()
            setQuotes([])
          }}
          refreshAll={() => {
            refreshAll()
          }}
        />
      )}
    </>
  )
}

const AddStockInfo = props => {
  const { stockInfo, handleClose, refreshAll } = props

  const defaultValues = {
    type: 'buy',
    quantity: '',
    date: new Date(),
    price: '',
    fee: 0,
    note: ''
  }

  const schema = yup.object().shape({
    quantity: yup.number().required('Quantità richiesta').moreThan(0, 'La quantità deve essere maggiore di 0'),
    price: yup.number().required('Prezzo richiesto'),
    date: yup.date().nullable().max(new Date(), 'La data non può essere nel futuro').required('Data obbligatoria')
  })

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const onSubmit = async newData => {
    try {
      await axiosInstance.post('/investimenti/add-transaction', { stockInfo, transactionData: newData })
      toast.success('Transazione aggiunta')
      reset()
      handleClose()
      refreshAll()
    } catch (error) {
      toast.error(error.message || error)
    }
  }

  return (
    <Drawer
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 420 } } }}
      open
    >
      <Header>
        <Typography variant='h6'>
          <Stack direction='row' alignItems='center'>
            Informazioni transazioni
          </Stack>
        </Typography>
        <IconButton size='small' onClick={handleClose} sx={{ color: 'text.primary' }}>
          <IconifyIcon icon='ic:outline-keyboard-arrow-left' fontSize={20} />
        </IconButton>
      </Header>
      <Box sx={{ p: 5 }}>
        <Typography variant='body1'>
          <Stack direction='row' alignItems='center'>
            {stockInfo?.longname || stockInfo?.shortname}
          </Stack>
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth sx={{ mb: 5 }}>
            {/* TIPO DI TRANSAZIONE */}
            <Controller
              name='type'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <FormControl sx={{ mt: 5 }} fullWidth>
                  <Stack>
                    <InputLabel>Tipo di transazione</InputLabel>
                    <Select value={value} label='Tipo di transazione' onChange={onChange} error={Boolean(errors.type)}>
                      <MenuItem value='buy'>Acquisto</MenuItem>
                      <MenuItem value='sell'>Vendita</MenuItem>
                      <MenuItem value='earn'>Ricompensa</MenuItem>
                    </Select>
                    {errors.type && (
                      <FormHelperText sx={{ color: 'error.main' }} id=''>
                        {errors.type.message}
                      </FormHelperText>
                    )}
                  </Stack>
                </FormControl>
              )}
            />

            {/* DATE */}
            <Controller
              name='date'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Stack sx={{ mt: 5 }}>
                  <DatePicker
                    {...field}
                    label='Data transazione'
                    format='dd/MM/yyyy'
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message
                      }
                    }}
                  />
                </Stack>
              )}
            />

            {/* QUANTITÀ */}
            <Controller
              name='quantity'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Stack sx={{ mt: 5 }}>
                  <TextField
                    value={value}
                    onChange={onChange}
                    error={Boolean(errors.quantity)}
                    type='number'
                    label='Quantità'
                  />
                </Stack>
              )}
            />

            {/* PREZZO */}
            <Controller
              name='price'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Stack>
                  <FormControl sx={{ mt: 5 }} fullWidth>
                    <InputLabel>Prezzo</InputLabel>
                    <OutlinedInput
                      value={value}
                      type='number'
                      label='Prezzo'
                      onChange={onChange}
                      error={Boolean(errors.price)}
                      endAdornment={<InputAdornment position='end'>{stockInfo?.currency}</InputAdornment>}
                    />
                  </FormControl>
                </Stack>
              )}
            />

            {/* FEE */}
            <Controller
              name='fee'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Stack sx={{ mt: 5 }}>
                  <TextField
                    placeholder='Opzionale'
                    value={value}
                    onChange={onChange}
                    error={Boolean(errors.fee)}
                    type='number'
                    label='Commissioni'
                  />
                </Stack>
              )}
            />

            {/* NOTE */}
            <Controller
              name='note'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Stack sx={{ mt: 5 }}>
                  <TextField
                    multiline
                    rows={3}
                    value={value}
                    label='Note'
                    onChange={onChange}
                    error={Boolean(errors.note)}
                  />
                </Stack>
              )}
            />

            <LoadingButton variant='contained' loading={isSubmitting} type='submit' sx={{ mt: 3 }}>
              Aggiungi
            </LoadingButton>
          </FormControl>
        </form>
      </Box>
    </Drawer>
  )
}

export default AddInvestmentTransaction
