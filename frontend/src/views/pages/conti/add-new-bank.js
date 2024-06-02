import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'
import { Box, FormControl, Stack, TextField, Typography } from '@mui/material'

import { DatePicker } from '@mui/x-date-pickers'
import { LoadingButton } from '@mui/lab'
import axiosInstance from 'src/utils/axios'
import { useAuth0 } from '@auth0/auth0-react'

const AddNewBank = props => {
  const { refreshData } = props

  const defaultValues = {
    cardName: '',
    balance: '',
    lastUpdate: new Date()
  }

  const schema = yup.object().shape({
    cardName: yup.string().required('Nome conto obbligatorio'),
    balance: yup.number().required('Importo obbligatorio'),
    lastUpdate: yup.date().nullable().max(new Date(), 'La data non può essere nel futuro').required('Data obbligatoria')
  })

  const auth = useAuth0()

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

  const onSubmit = async data => {
    try {
      const token = await auth.getAccessTokenSilently()
      await axiosInstance.post('/conti/add-conto', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      toast.success('Conto aggiunto con successo')
      reset()
      refreshData()
    } catch (error) {
      toast.error(error.message || error)
    }
  }

  return (
    <Box sx={{ p: 6 }}>
      <Typography variant='h6' sx={{ mb: 5 }}>
        <Stack direction='row' alignItems='center'>
          Aggiungi Conto
        </Stack>
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl fullWidth sx={{ mb: 5 }}>
          {/* DATE */}
          <Controller
            name='lastUpdate'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Stack sx={{ mb: 5 }}>
                <DatePicker
                  {...field}
                  label='Data'
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
          {/* CARDNAME */}
          <Controller
            name='cardName'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <Stack sx={{ mb: 5 }}>
                <TextField value={value} label='Nome Banca' onChange={onChange} error={Boolean(errors.cardName)} />
              </Stack>
            )}
          />
          {/* BALANCE */}
          <Controller
            name='balance'
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
                  error={Boolean(errors.balance)}
                />
              </Stack>
            )}
          />
          <LoadingButton loading={isSubmitting} type='submit' variant='contained' sx={{ mr: 3 }}>
            Aggiungi
          </LoadingButton>
        </FormControl>
      </form>
    </Box>
  )
}

export default AddNewBank
