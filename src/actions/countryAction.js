var config = require('../../config');
var country_codes = require('../utils/country_codes')
var country_centroids = require('../utils/country_centroid')
var api_url = config.api_url;
var topojson = require('topojson');
import axios from 'axios';

export function fetchCountries() {
  console.log("AAAAAA")
  console.log(api_url, '!!!!')
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

export function recolorCountries(colorByValue) {
  return function(dispatch) {
    dispatch({
      type: 'RECOLOR_MAP',
      payload: {
        colorByValue: colorByValue,
      }
    })
  }
}

export function displayCountry(country_name) {
  return function(dispatch) {
    dispatch({
      type: 'countrySelected',
      payload: {
        country: country_codes[country_name],
        country_name: country_name,
        centroid: country_centroids[country_codes[country_name]]
      }
    })
  }
}

export function fetchCountry(country_name) {
  var country_code = country_codes[country_name];
  return function(dispatch) {
    console.log('About to fetch', country_code)
    axios.get(api_url + 'population/topojson/' + country_code)
    .then(response => {
      console.log(country_name, 'Fetched!')
      var geojson = topo_2_geo(response.data);
      window.geojson = geojson;
      dispatch({
        type: 'COUNTRY_FETCHED',
        payload: {
          country: country_code,
          geojson: geojson
        }
      })
    })
  }
}

function topo_2_geo(t) {
  return topojson.feature(t, t.objects.collection)
}
