import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux' // Import the component that connects React to Redux.
import store from './context/store.js' // Import the store that holds shared application state.
import './components/global/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode> {/* Enable React's development checks around the application. */}
    <Provider store={store}> {/* Make the Redux store available to every component below this point. */}
      <App /> {/* Render the router and pages inside the Redux provider. */}
    </Provider> {/* Close the provider after all store-consuming components. */}
  </StrictMode>, // Close the development checks wrapper.
)
