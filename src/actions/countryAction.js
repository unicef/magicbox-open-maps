var config = require('../../config');
var api_url = config.api_url;
import axios from 'axios';

export function fetchCountries() {
  return function(dispatch) {
    axios.get(api_url + 'population')
    .then(response => {
      dispatch({
        type: 'COUNTRIES_FETCHED',
        payload: response
      })
    })
  }
}

export function fetchCountry(country_code) {
  return function(dispatch) {
    axios.get(api_url + 'population/' + country_code)
    .then(response => {
      dispatch({
        type: 'COUNTRY_FETCHED',
        payload: {
          country: country_code,
          response: response
        }
      })
    })
  }
}
