var config = require('../../config');
var country_codes = require('../utils/country_codes')
var country_centroids = require('../utils/country_centroid')
var api_url = config.api_url;
var topojson = require('topojson');

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

export function recolorCountries(colorByValue) {
  return function(dispatch) {
    dispatch({
      type: 'RECOLOR_GEOCHART',
      payload: {
        colorByValue: colorByValue,
      }
    })
  }
}

export function rescaleColorCountries(scaleColorByValue) {
  return function(dispatch) {
    dispatch({
      type: 'RESCALE_GEOCHART_COLOR',
      payload: {
        scaleColorBy: scaleColorByValue,
      }
    })
  }
}

export function displayCountry(country_name) {
  return function(dispatch) {
    dispatch({
      type: 'COUNTRY_SELECTED',
      payload: {
        country: country_codes[country_name],
        country_name: country_name,
        latLng: country_centroids[country_codes[country_name]]
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
      // window.geojson just for debug in browser
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

// function determine_admin_level(geojson) {
//   return Object.keys(geojson.features[0].properties)
//   .filter(k => {
//     return k.match(/ID_/)
//   }).map(e => {
//     var ary_num = e.match(/\d/);
//     // return ary_num ? ary_num[0] : null;
//     return ary_num[0];
//   }).sort((a, b) => {
//     return b - a;
//   })[0];
// }
