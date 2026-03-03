import '@/styles/globals.scss'
import '@/styles/template.scss'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/store/index'
import { AuthEventBridge } from '@/components/common/AuthEventBridge'
import { SessionRestorer } from '@/components/common/SessionRestorer'
import { UserDataFetcher } from '@/components/common/UserDataFetcher'
import { GoogleOAuthProvider } from '@react-oauth/google'

export default function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthEventBridge />
          <SessionRestorer />
          <UserDataFetcher />
          {getLayout(<Component {...pageProps} />)}
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  )
}
