// const countryCodeIndex = require('../utils/country_codes');
const codeCountryIndex = require('../utils/codes_countries');
var FileSaver = require('file-saver');
var L = require('leaflet');

export default function reducer(state={
  // Formatted for google geo-chart
  countries: [['country']],
  dimensions: ['population', 'pop_density'],
  scales: ['linear', 'logarithmic'],
  // Array of countries and their meta data from api
  countries_raw: null,
  // ISO 3 letter code
  country: null,
  country_name: null,
  geojson: null,
  // Options include population, population density
  colorBy: 'population',
  scaleColorBy: 'linear',
  fetching: false,
  fetched: false,

  geoChart_data: {population: {}, pop_density: {}},
  // An object with keys: 'linear' and 'logarithmic'
  layer_population: null,
  layer_pop_density: null,
  layer_population_old: null,
  layer_pop_density_old: null,
  error: null,
  area: null
}, action) {
  switch(action.type) {
    case 'COUNTRY_SELECTED':
      var country = action.payload.country;
      return {
        ...state,
        admin_level: determine_admin_level(country, state),
        country: country,
        country_name: action.payload.country_name,
      }
    break;
    case 'COUNTRIES_FETCHED':
      // json list of countries with population available
      var countries_raw = action.payload.data.countries;
      var geoChart_data = geochart_data(
        countries_raw,
        state.dimensions,
        state.scales
      );
      return {
        ...state,
        countries_raw: countries_raw,
        geoChart_data: geoChart_data
      }
      break;
    case 'RECOLOR_GEOCHART':
      // Process countries for color on Google geoChart
      return {
        ...state,
        layer_population_old: state.layer_population,
        layer_pop_density_old: state.layer_pop_density,
        colorBy: action.payload.colorByValue
      }
      break;
      case 'RESCALE_GEOCHART_COLOR':
        return {
          ...state,
          layer_population_old: state.layer_population,
          layer_pop_density_old: state.layer_pop_density,
          scaleColorBy: action.payload.scaleColorBy
        }
        break;
    case 'COUNTRY_FETCHED':
      // var admin_level = action.payload.admin_level;
      // var country_code = action.payload.country;
      var geojson = action.payload.geojson;
      // var blob = new Blob([JSON.stringify(geojson)], {type: "data:text/json;charset=utf-8"});
      // FileSaver.saveAs(blob, 'aaa' + '.json');
      return {
        ...state,
        // admin_level: action.payload.admin_level,
        country: action.payload.country,
        geojson: geojson,
        layer_population_old: state.layer_population,
        layer_pop_density_old: state.layer_pop_density,
        layer_population: {
          linear: create_layer('population', geojson, 'linear'),
          logarithmic: create_layer('population', geojson, 'logarithmic')
        },
        layer_pop_density:{
          linear: create_layer('pop_density', geojson, 'linear'),
          logarithmic: create_layer('pop_density', geojson, 'logarithmic')
        },
        area: get_total(geojson, 'sq_km')
      };
      break;
    default:
      return state;
  }
}

function get_max(geojson, kind) {
  var max;
  geojson.features.forEach(f => {
    var value = f.properties[kind];
    max = max ? (value > max ? value : max) : value;
    // min = min ? (value < min ? value : min) : value;
  });
  return max;
}
// fraction is for 0..1, for leaflet opacity
function get_strength(val, high, colorBy, scaleColorBy, fraction) {
  // console.log(colorBy, scaleColorBy, val, high)
  if (scaleColorBy.match(/linear/)) {
    return fraction ? (val / high) : val;
  } else {
    var log = high/4;
    return val >= log ? (val/high) : (val/log)
  }
}

function create_layer(colorBy, geojson, scaleColorBy) {
  var high = get_max(geojson, colorBy);
  return L.geoJSON(geojson, {
    style: (f) => {
      var strength = get_strength(f.properties[colorBy], high, colorBy, scaleColorBy, true)
      return {
        fillColor: 'red',
        color: 'black',
        weight: 0.1,
        dashArray: '3',
        opacity: 0.65,
        fillOpacity: strength
      }
    }
  })
}

function get_total(geojson, kind) {
  return geojson.features.reduce((sum, f) => {
    return sum + f.properties[kind];
  }, 0)
}


function get_maximum(countries_raw, dimension) {
  var countries = Object.keys(countries_raw);
  // console.log(countries.reduce((h,c) => {
  //    h[c] = parse_attribute(countries_raw, c, dimension)
  //    return h
  // }, {}))
  var max = countries.map(c => {
    if (c === 'sgp') {
      return 0;
    }
    return parse_attribute(countries_raw, c, dimension)
  }).sort((a, b) => {
    return b - a;
  })[0]
    console.log(dimension, max)
  return max
}

// Process countries for color on Google geoChart
function geochart_data(countries_raw, dimensions, scales) {
  // countries_raw is raw json from api /population
  // {population: 1806646877, pop_density: 19970, sq_km: 3622477}
  return dimensions.reduce((h, d) => {
    h[d] = {};
    var maximum = get_maximum(countries_raw, d);
    scales.forEach(s => {
      var countries = Object.keys(countries_raw).reduce((ary, c) => {
          // Singapore's pop density too high, ignore it altogether.
          if (c!=='sgp') {
            ary.push([
              codeCountryIndex[c],
              colorByValue(countries_raw, c, d, s, maximum)
            ])
          }
        return ary;
      }, []);
      countries.unshift(['Country', d]);
      h[d][s] = countries;
    })
    return h
  }, {})
}

function parse_attribute(countries_raw, country, kind) {
  // kind is population or pop_density
  return parseInt(
    countries_raw[country][
      Object.keys(
        countries_raw[country]
      )[0]][0][kind], 10
    );
}

function colorByValue(countries_raw, country, dimension, scale, high) {
  var value = parse_attribute(countries_raw, country, dimension);
  var val_strength = get_strength(value, high, dimension, scale);
  return val_strength
}


function determine_admin_level(country_iso, state) {
  var primary_raster = Object.keys(state.countries_raw[country_iso])[0];
  return state.countries_raw[country_iso][primary_raster][0].admin_level;
}
