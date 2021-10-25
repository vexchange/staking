import Layout from '../components/Layout'

import { AppStateProvider } from '../context/app'
import { DataContextProvider } from '../context/data'
import { TransactionsProvider } from '../context/transactions'

import 'bootstrap/dist/css/bootstrap.min.css'
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

export default App
