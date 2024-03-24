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

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'

// ** Demo Imports

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

const VerifyRegistration = () => {
  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()

  const router = useRouter()
  const email = router.query.email

  // ** Vars
  const { skin } = settings
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

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
            <Box sx={{ mb: 8 }}>
              <Typography variant='h5' sx={{ mb: 2 }}>
                Verifica la tua email ✉️
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Abbiamo inviato un link di conferma alla tua mail: <strong>{email}</strong>.Segui le istruzioni nella
                mail per confermare la registrazione.
              </Typography>
            </Box>
            <Button href='/login' component={Link} fullWidth variant='contained'>
              Torna al login
            </Button>
          </BoxWrapper>
        </Box>
      </RightWrapper>
    </Box>
  )
}

VerifyRegistration.getLayout = page => <BlankLayout>{page}</BlankLayout>
VerifyRegistration.guestGuard = true

export default VerifyRegistration
