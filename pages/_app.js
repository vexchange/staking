import Layout from '../components/Layout'

import { AppStateProvider } from '../context/app'
import { TransactionsProvider } from '../context/transactions'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.css'

function App({ Component, pageProps }) {
  return (
    <AppStateProvider>
      <TransactionsProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </TransactionsProvider>
    </AppStateProvider>
  )
}

export default App
