import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import './index.css';
// import {Provider} from 'react-redux';
// import configureStore from './store';
// const store = configureStore();
ReactDOM.render(<Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
