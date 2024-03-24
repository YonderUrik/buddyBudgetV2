// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import useMediaQuery from '@mui/material/useMediaQuery'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuth } from 'src/hooks/useAuth'
import FormHelperText from '@mui/material/FormHelperText'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import { LoadingButton } from '@mui/lab'

// ** Styled Components
const RegisterIllustrationWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10)
  }
}))

const RegisterIllustration = styled('img')(({ theme }) => ({
  maxWidth: '48rem',
  [theme.breakpoints.down('xl')]: {
    maxWidth: '38rem'
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '30rem'
  }
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 400
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 450
  }
}))

const BoxWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.down('md')]: {
    maxWidth: 400
  }
}))

const TypographyStyled = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '0.18px',
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: { marginTop: theme.spacing(8) }
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const Register = () => {
  // ** States
  const [showPassword, setShowPassword] = useState(false)
  const auth = useAuth()

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** Vars
  const { skin } = settings

  const schema = yup.object().shape({
    name: yup.string().required('Nome richiesto'),
    email: yup.string().email("L'email non è del formatto corretto").required('Email richiesta'),
    password: yup
      .string()
      .min(8, 'La password deve contenere almeno 8 caratteri')
      .matches(/^(?=.*[!@#$%^&*])/, 'La password deve contenere almeno un carattere speciale [!@#$%^&*]')
      .matches(/^(?=.*[0-9])/, 'La password deve contenere almeno un numero')
      .matches(/^(?=.*[A-Z])/, 'La password deve contenere almeno un carattere maiuscolo')
      .required('Password richiesta'),
    agreement: yup.boolean().oneOf([true], 'Devi accettare le policy')
  })

  const defaultValues = {
    password: '',
    email: '',
    name: '',
    agreement: false
  }

  const {
    control,
    setError,
    handleSubmit,
    isSubmitting,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = data => {
    const { name, email, password, agreement } = data
    auth.register({ name, email, password, agreement }, err => {
      setError('email', {
        type: 'manual',
        message: err.message || err
      })
    })
  }

  return (
    <Box className='content-right'>
      {!hidden ? (
        <Box sx={{ flex: 1, display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <RegisterIllustrationWrapper>
            <RegisterIllustration
              alt='register-illustration'
              src={`/images/pages/auth-v2-register-illustration-${theme.palette.mode}.gif`}
            />
          </RegisterIllustrationWrapper>
        </Box>
      ) : null}
      <RightWrapper sx={skin === 'bordered' && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}>
        <Box
          sx={{
            p: 7,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.paper'
          }}
        >
          <BoxWrapper>
            <Box
              sx={{
                top: 30,
                left: 40,
                display: 'flex',
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src='/images/android-chrome-512x512.png' alt='logo' width='48' height='48' />
              <Typography variant='h6' sx={{ ml: 2, lineHeight: 1, fontWeight: 700, fontSize: '1.5rem !important' }}>
                {themeConfig.templateName}
              </Typography>
            </Box>
            <Box sx={{ mb: 6 }}>
              <TypographyStyled variant='h5'>Registrati a BuddyBudget 🚀</TypographyStyled>
            </Box>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
              <FormControl fullWidth sx={{ mb: 4 }}>
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextField
                      autoComplete='off'
                      label='Nome'
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      error={Boolean(errors.name)}
                    />
                  )}
                />
                {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
              </FormControl>
              <FormControl fullWidth sx={{ mb: 4 }}>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextField
                      autoComplete='off'
                      label='Email'
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      error={Boolean(errors.email)}
                    />
                  )}
                />
                {errors.email && <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth>
                <InputLabel htmlFor='auth-login-v2-password' error={Boolean(errors.password)}>
                  Password
                </InputLabel>
                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <OutlinedInput
                      value={value}
                      onBlur={onBlur}
                      label='Password'
                      onChange={onChange}
                      id='auth-login-v2-password'
                      error={Boolean(errors.password)}
                      type={showPassword ? 'text' : 'password'}
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} fontSize={20} />
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  )}
                />
                {errors.password && (
                  <FormHelperText sx={{ color: 'error.main' }} id=''>
                    {errors.password.message}
                  </FormHelperText>
                )}
              </FormControl>

              <Controller
                name='agreement'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <FormControlLabel
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    control={<Checkbox />}
                    sx={{ mb: 4, mt: 1.5, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                    label={
                      <>
                        <Typography variant='body2' component='span'>
                          Accetto{' '}
                        </Typography>
                        <PrivacyPolicy /> & <CookiePolicy />
                        {errors.agreement && (
                          <FormHelperText sx={{ color: 'error.main' }}>{errors.agreement.message}</FormHelperText>
                        )}
                      </>
                    }
                  />
                )}
              />

              <LoadingButton
                loading={isSubmitting}
                fullWidth
                size='large'
                type='submit'
                variant='contained'
                sx={{ mb: 7 }}
              >
                Registrati
              </LoadingButton>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Typography sx={{ mr: 2, color: 'text.secondary' }}>Hai già un account?</Typography>
                <Typography href='/login' component={Link} sx={{ color: 'primary.main', textDecoration: 'none' }}>
                  Accedi
                </Typography>
              </Box>
            </form>
          </BoxWrapper>
        </Box>
      </RightWrapper>
    </Box>
  )
}
Register.getLayout = page => <BlankLayout>{page}</BlankLayout>
Register.guestGuard = true

export default Register

export const CookiePolicy = () => {
  useEffect(() => {
    // Load the Iubenda script
    const loader = () => {
      const s = document.createElement('script')
      const tag = document.getElementsByTagName('script')[0]
      s.src = 'https://cdn.iubenda.com/iubenda.js'
      tag.parentNode.insertBefore(s, tag)
    }
    if (window.addEventListener) {
      window.addEventListener('load', loader, false)
    } else if (window.attachEvent) {
      window.attachEvent('onload', loader)
    } else {
      window.onload = loader
    }
  }, [])

  const openInNewTab = url => {
    const newWindow = window.open(url, '_blank')
    if (newWindow) newWindow.opener = null
  }

  return (
    <a
      href='https://www.iubenda.com/privacy-policy/70257790/cookie-policy'
      className='iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe'
      title='Cookie Policy'
      onClick={e => {
        e.preventDefault()
        openInNewTab(e.target.href)
      }}
    >
      Cookie Policy
    </a>
  )
}

export const PrivacyPolicy = () => {
  useEffect(() => {
    // Load the Iubenda script
    const loader = () => {
      const s = document.createElement('script')
      const tag = document.getElementsByTagName('script')[0]
      s.src = 'https://cdn.iubenda.com/iubenda.js'
      tag.parentNode.insertBefore(s, tag)
    }
    if (window.addEventListener) {
      window.addEventListener('load', loader, false)
    } else if (window.attachEvent) {
      window.attachEvent('onload', loader)
    } else {
      window.onload = loader
    }
  }, [])

  const openInNewTab = url => {
    const newWindow = window.open(url, '_blank')
    if (newWindow) newWindow.opener = null
  }

  return (
    <a
      href='https://www.iubenda.com/privacy-policy/70257790'
      className='iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe'
      title='Privacy Policy'
      onClick={e => {
        e.preventDefault()
        openInNewTab(e.target.href)
      }}
    >
      Privacy Policy
    </a>
  )
}
