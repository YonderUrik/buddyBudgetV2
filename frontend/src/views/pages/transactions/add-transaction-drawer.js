// ** React Imports
import { useCallback, useEffect, useState } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { Autocomplete, CircularProgress, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material'
import toast from 'react-hot-toast'
import axios from 'src/utils/axios'
import { LoadingButton } from '@mui/lab'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default
}))

const AddTransactionDrawer = props => {
  // ** Props
  const { refreshAllData } = props
  const [open, setOpen] = useState(false)
  const [transactionType, setTransactionType] = useState('out')
  const [contiList, setContiList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState({})
  const [subcategories, setSintCategories] = useState([])

  useEffect(() => {
    if (transactionType !== 'transfer' && Object.keys(categories).length > 0) {
      const subcategoriesTMP = categories[transactionType].reduce((acc, category) => {
        const categoryLabel = category.category_name
        const categoryId = category.category_id

        const subcategoryOptions = category.subcategories.map(subcategory => ({
          label: subcategory.subcategory_name,
          value: subcategory.subcategory_id,
          category: categoryLabel,
          categoryId
        }))

        return [...acc, ...subcategoryOptions]
      }, [])
      setSintCategories(subcategoriesTMP)
    }
  }, [categories, transactionType])

  const [schema, setSchema] = useState(yup.object().shape())
  const [defaultValues, setDefaultSchema] = useState({})

  const {
    reset,
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting },
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  useEffect(() => {
    if (transactionType === 'transfer') {
      const TMPschema = yup.object().shape({
        type: yup.string().required('Tipo di transazione obbligatoria'),
        cardName: yup.string().required('Conto mittente obbligatorio'),
        cardNameTo: yup.string().required('Conto destinatario obbligatorio'),
        date: yup.date().nullable().max(new Date(), 'La data non può essere nel futuro').required('Data obbligatoria'),
        amount: yup.number().required('Importo obbligatorio')
      })

      setSchema(TMPschema)

      const TMPdefaultValues = {
        type: transactionType,
        cardName: contiList[0] || 'Conto esterno',
        cardNameTo: null,
        amount: '',
        note: '',
        date: new Date()
      }

      setDefaultSchema(TMPdefaultValues)
      reset(TMPdefaultValues)
    } else {
      const TMPschema = yup.object().shape({
        type: yup.string().required('Tipo di transazione obbligatoria'),
        cardName: yup.string().required('Conto obbligatorio'),
        category: yup.object().required('Categoria obbligatoria'),
        date: yup.date().nullable().max(new Date(), 'La data non può essere nel futuro').required('Data obbligatoria'),
        amount: yup.number().required('Importo obbligatorio')
      })

      setSchema(TMPschema)

      const TMPdefaultValues = {
        type: transactionType,
        cardName: contiList[0] || 'Conto esterno',
        amount: '',
        note: '',
        category: null,
        date: new Date()
      }
      setDefaultSchema(TMPdefaultValues)
      reset(TMPdefaultValues)
    }
  }, [transactionType, contiList, reset])

  const getContiSummary = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.post('/home/get-conti-summary', {})
      const { data } = response
      setContiList(data.map(conto => conto._id))
      reset()
    } catch (error) {
      toast.error(error.message || error)
      handleClose()
    } finally {
      setIsLoading(false)
    }
  }, [open])

  const getCategories = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/home/get-categories', {})
      const { data } = response
      setCategories(data)
    } catch (error) {
      toast.error(error.message || error)
      handleClose()
    } finally {
      setIsLoading(false)
    }
  }, [open])

  useEffect(() => {
    getContiSummary()
    getCategories()
  }, [getContiSummary, getCategories])

  const onSubmit = async data => {
    try {
      await axios.post('/transazioni/add-transaction', data)
      toast.success('Transazione aggiunta')
      reset()
      refreshAllData()
    } catch (error) {
      toast.error(error.message || error)
    }
  }



  const handleTransactionType = (event, newType) => {
    if (newType !== null) {
      reset()
      setTransactionType(newType)
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        startIcon={<Icon icon='gridicons:add' />}
        sx={{ mt: 10 }}
        variant='contained'
      >
        Transazione
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
            <Icon icon='mdi:close' fontSize={20} />
          </IconButton>
        </Header>
        <Box sx={{ p: 5 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl fullWidth sx={{ mb: 5 }}>
              {/* BUTTON TOGGLE TRANSACTION TYPE */}
              <ToggleButtonGroup
                value={transactionType}
                exclusive
                onChange={handleTransactionType}
                sx={{ mb: 5, display: 'flex', flexWrap: 'wrap' }}
                variant='contained'
                size='small'
              >
                <ToggleButton color='success' value='in'>
                  <Icon icon='majesticons:money-plus-line' /> Entrata
                </ToggleButton>
                <ToggleButton color='error' value='out'>
                  <Icon icon='majesticons:money-minus-line' />
                  Spesa
                </ToggleButton>
                <ToggleButton color='info' value='transfer'>
                  <Icon icon='iconoir:data-transfer-both' />
                  Transferimento
                </ToggleButton>
              </ToggleButtonGroup>
              {/* DATE */}
              <Controller
                name='date'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Stack sx={{ mb: 5 }}>
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
              {/* BANK FROM */}
              <Controller
                name='cardName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Stack sx={{ mb: 5 }}>
                    <Autocomplete
                      options={[...contiList, 'Conto esterno']}
                      value={value}
                      onChange={(event, newValue) => onChange(newValue)} // Assicurati di passare solo il nuovo valore a onChange
                      renderInput={params => (
                        <TextField
                          {...params}
                          label={transactionType === 'transfer' ? 'Conto di partenza' : 'Conto'}
                          error={Boolean(errors.cardName)}
                        />
                      )}
                    />
                    {errors.cardName && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.cardName.message}</FormHelperText>
                    )}
                  </Stack>
                )}
              />
              {transactionType === 'transfer' ? (
                <Controller
                  name='cardNameTo'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <Stack sx={{ mb: 5 }}>
                      <Autocomplete
                        options={[...contiList, 'Conto esterno'].filter(item => item !== watch('cardName'))}
                        value={value}
                        onChange={(event, newValue) => onChange(newValue)} // Assicurati di passare solo il nuovo valore a onChange
                        renderInput={params => (
                          <TextField {...params} label='Conto di destinazione' error={Boolean(errors.cardNameTo)} />
                        )}
                      />
                      {errors.cardNameTo && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.cardNameTo.message}</FormHelperText>
                      )}
                    </Stack>
                  )}
                />
              ) : (
                <Controller
                  name='category'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <Stack sx={{ mb: 5 }}>
                      <Autocomplete
                        sx={{ my: 1 }}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        options={subcategories}
                        value={value}
                        groupBy={option => option.category}
                        getOptionLabel={option => option.label}
                        onChange={(event, newValue) => onChange(newValue)} // Assicurati di passare solo il nuovo valore a onChange
                        renderInput={params => (
                          <TextField {...params} label='Categoria' error={Boolean(errors.category)} />
                        )}
                      />
                      {errors.category && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.category.message}</FormHelperText>
                      )}
                    </Stack>
                  )}
                />
              )}
              {/* NOTE */}
              <Controller
                name='note'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Stack sx={{ mb: 5 }}>
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
              {/* AMOUNT */}
              <Controller
                name='amount'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Stack sx={{ mb: 5 }}>
                    <TextField
                      type='number'
                      value={value}
                      label='Importo'
                      onChange={onChange}
                      placeholder='EUR'
                      inputProps={{ step: '0.01' }} // Imposta il passo a 0.01 per consentire solo due cifre decimali
                      error={Boolean(errors.amount)}
                    />
                  </Stack>
                )}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LoadingButton
                  loading={isSubmitting}
                  disabled={isLoading}
                  type='submit'
                  variant='contained'
                  sx={{ mr: 3 }}
                >
                  Aggiungi
                </LoadingButton>
                <Button variant='outlined' color='secondary' onClick={handleClose}>
                  Cancella
                </Button>
              </Box>
            </FormControl>
          </form>
        </Box>
      </Drawer>
    </>
  )
}

export default AddTransactionDrawer
