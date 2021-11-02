import PropTypes from 'prop-types'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-tippy/dist/tippy.css'

import Layout from '../components/Layout'

import { AppStateProvider } from '../context/app'
import { DataContextProvider } from '../context/data'
import { TransactionsProvider } from '../context/transactions'

import '../styles/globals.css'

function App({ Component, pageProps }) {
  return (
    <AppStateProvider>
      <TransactionsProvider>
        <DataContextProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </DataContextProvider>
      </TransactionsProvider>
    </AppStateProvider>
  )
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  pageProps: PropTypes.object.isRequired,
}

export default App
