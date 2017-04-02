import { combineReducers } from 'redux';

import country from './countryReducer';
import map from './mapReducer';
export default combineReducers({
  country,
  map
})
