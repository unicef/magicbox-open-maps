import { applyMiddleware, createStore } from 'redux';
// import logger from 'redux-logger';
import thunk from 'redux-thunk';
// import promise from 'redux-promise-middleware';
import reducer from './reducers';

// const middleware = applyMiddleware(promise(), thunk, logger);
const middleware = applyMiddleware(thunk);

export default createStore(reducer, middleware);

// export default(initialState) => {
//   return createStore(reducer, initialState);
// }
