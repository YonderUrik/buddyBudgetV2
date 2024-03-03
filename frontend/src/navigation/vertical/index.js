const navigation = () => {
  return [
    {
      title: 'Home',
      icon: 'carbon:home',
      path: '/'
    },
    {
      title: 'Conti',
      icon: 'material-symbols:account-balance-outline-rounded',
      path: '/conti'
    },
    {
      title: 'Transazioni',
      icon: 'icon-park-outline:transaction-order',
      path: '/transazioni'
    },
    {
      title: 'Statistiche',
      icon: 'codicon:pie-chart',
      path: '/statistiche'
    },
    {
      title: 'Investimenti',
      icon: 'ic:outline-candlestick-chart',
      path: '/investimenti'
    }
  ]
}

export default navigation
