const DefaultPalette = (mode, skin) => {
  // ** Vars
  const whiteColor = '#FFF'
  const lightColor = '76, 78, 100'
  const darkColor = '234, 234, 255'
  const mainColor = mode === 'light' ? lightColor : darkColor

  const defaultBgColor = () => {
    if (skin === 'bordered' && mode === 'light') {
      return whiteColor
    } else if (skin === 'bordered' && mode === 'dark') {
      return '#171717'
    } else if (mode === 'light') {
      return '#f9fafb'
    } else return '#212121'
  }

  return {
    customColors: {
      dark: darkColor,
      main: mainColor,
      light: lightColor,
      darkBg: '#212121',
      lightBg: '#f9fafb',
      bodyBg: mode === 'light' ? '#f9fafb' : '#212121',
      trackBg: mode === 'light' ? '#F2F2F4' : '#41435C',
      avatarBg: mode === 'light' ? '#F1F1F3' : '#3F425C',
      tooltipBg: mode === 'light' ? '#262732' : '#464A65',
      tableHeaderBg: mode === 'light' ? '#F5F5F7' : '#3A3E5B'
    },
    mode: mode,
    common: {
      black: '#000',
      white: whiteColor
    },
    primary: {
      light: mode === 'dark' ? '#4776C7' : '#4776C7',
      main: mode === 'dark' ? '#1746A2' : '#1746A2', // #FBA834 ARANCIO
      dark: mode === 'dark' ? '#10358B' : '#10358B',
      contrastText: whiteColor
    },
    secondary: {
      light: mode === 'light' ? '#4776C7' : '#4776C7',
      main: mode === 'light' ? '#1746A2' : '#1746A2',
      dark: mode === 'light' ? '#10358B' : '#10358B',
      contrastText: whiteColor
    },
    info: {
      light: mode === 'dark' ? '#34C9D2' : '#34C9D2',
      main: mode === 'dark' ? '#009CB5' : '#009CB5',
      dark: mode === 'dark' ? '#00799B' : '#00799B',
      contrastText: whiteColor
    },
    success: {
      light: mode === 'dark' ? '#4EC149' : '#4EC149',
      main: mode === 'dark' ? '#1A9920' : '#1A9920',
      dark: mode === 'dark' ? '#138322' : '#138322',
      contrastText: whiteColor
    },
    error: {
      light: '#FF625F',
      main: '#FF4D49',
      dark: '#E04440',
      contrastText: whiteColor
    },
    warning: {
      light: '#FDBE42',
      main: '#FDB528',
      dark: '#DF9F23',
      contrastText: whiteColor
    },
    grey: {
      50: '#FAFAFA',
      100: '#f9fafb',
      200: '#f9fafb',
      300: '#f9fafb',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#f9fafb',
      A200: '#f9fafb',
      A400: '#BDBDBD',
      A700: '#616161'
    },
    text: {
      primary: `rgba(${mainColor}, 0.87)`,
      secondary: `rgba(${mainColor}, 0.6)`,
      disabled: `rgba(${mainColor}, 0.38)`
    },
    divider: `rgba(${mainColor}, 0.12)`,
    background: {
      paper: mode === 'light' ? whiteColor : '#171717',
      default: defaultBgColor()
    },
    action: {
      active: `rgba(${mainColor}, 0.54)`,
      hover: `rgba(${mainColor}, 0.05)`,
      hoverOpacity: 0.05,
      selected: `rgba(${mainColor}, 0.08)`,
      disabled: `rgba(${mainColor}, 0.26)`,
      disabledBackground: `rgba(${mainColor}, 0.12)`,
      focus: `rgba(${mainColor}, 0.12)`
    }
  }
}

export default DefaultPalette
