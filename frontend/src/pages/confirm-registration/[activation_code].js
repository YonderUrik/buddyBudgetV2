// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useAuth } from 'src/hooks/useAuth'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import { Alert, CircularProgress, LinearProgress } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

// ** Styled Components
const VerifyEmailIllustrationWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10)
  }
}))

const VerifyEmailIllustration = styled('img')(({ theme }) => ({
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

const ConfirmRegistration = () => {
  const router = useRouter()
  const { activation_code } = router.query

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()

  // ** Vars
  const auth = useAuth()
  const { skin } = settings
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const ConfirmRegistration = useCallback(async () => {
    if (activation_code) {
      setIsLoading(true)
      auth.confirm_registration({ activation_code }, err => {
        setError(err.message || err)
      })
      setIsLoading(false)
      router.replace('/login')
    }
  }, [activation_code])

  useEffect(() => {
    ConfirmRegistration()
  }, [ConfirmRegistration])

  return (
    <Box className='content-right'>
      {!hidden ? (
        <Box sx={{ flex: 1, display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <VerifyEmailIllustrationWrapper>
            <VerifyEmailIllustration
              alt='verify-email-illustration'
              src={`/images/pages/auth-v2-verify-registration-illustration-${theme.palette.mode}.gif`}
            />
          </VerifyEmailIllustrationWrapper>
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
            <Box alignContent='center' alignItems='center' sx={{ mb: 8 }}>
              {isLoading && (
                <>
                  <Typography variant='h5' sx={{ mb: 2 }}>
                    Stiamo attivando il tuo account...
                  </Typography>
                  <LinearProgress />
                </>
              )}
              {error && <Alert severity='error'>{error}</Alert>}
            </Box>
          </BoxWrapper>
        </Box>
      </RightWrapper>
    </Box>
  )
}
ConfirmRegistration.getLayout = page => <BlankLayout>{page}</BlankLayout>
ConfirmRegistration.guestGuard = true

export default ConfirmRegistration
