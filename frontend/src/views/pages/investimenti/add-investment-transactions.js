import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
  styled
} from '@mui/material'
import { useState } from 'react'
import IconifyIcon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import axiosInstance from 'src/utils/axios'
import { ContactlessOutlined } from '@mui/icons-material'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default
}))

const AddInvestmentTransaction = () => {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [quotes, setQuotes] = useState([])

  const handleClose = () => {
    setOpen(false)
    setQuotes([])
  }

  const [schema, setSchema] = useState(yup.object().shape({ symbol: yup.string().required('Inserisci un valore') }))
  const [defaultValues, setDefaultSchema] = useState({ symbol: '' })

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

  console.log(quotes)
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
            {quotes.map(quote => (
              <ListItem
                sx={{ border: 1, borderRadius: 1, borderColor: 'text.disabled', mb: 2 }}
                key={quote.symbol}
                secondaryAction={
                  <IconButton edge='end' aria-label='delete'>
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
    </>
  )
}

export default AddInvestmentTransaction
