import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import { persistStore } from "redux-persist";

import store from "./store";
import "./index.css";
import "bootstrap/dist/css/bootstrap.css";
import App from "./App";

async function enableMocking() {
  console.log(`NODE_ENV is ${process.env.NODE_ENV}`)
  if (process.env.NODE_ENV !== 'development') {
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
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>,
    );
  }
}

enableMocking().then(() => renderApp())




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
