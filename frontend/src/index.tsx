import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import { persistStore } from "redux-persist";
import { Auth0Provider } from '@auth0/auth0-react';

import store from "./store";
import "./index.css";
import "bootstrap/dist/css/bootstrap.css";
import App from "./App";

async function enableMocking() {
  console.log(`NODE_ENV is ${process.env.NODE_ENV}`)
  if (process.env.NODE_ENV !== 'dev') {
    return
  }
 
  const { worker } = await import('./mocks/browser.js')
 
  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start()
}

const renderApp = () => {
  const persistor = persistStore(store);
  const rootEl: HTMLElement | null = document.getElementById("root");
  if (rootEl != null) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <Auth0Provider
      domain="dev-akcpb5t2powmgxer.us.auth0.com"
      clientId="ePyflRQeGysD5yi5tgrCY5UtDM6nZa5T"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      >
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
      </Auth0Provider>,
    );
  }
}

enableMocking().then(() => renderApp())




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
