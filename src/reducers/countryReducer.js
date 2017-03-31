// const countryCodeIndex = require('../utils/country_codes');
const codeCountryIndex = require('../utils/codes_countries');
var FileSaver = require('file-saver');
var L = require('leaflet');

export default function reducer(state={
    admin_level: null,
    centroid: [33.939110, 67.709953],
    // Formatted for google geo-chart
    countries: [['country']],
    // Array of countries and their meta data from api
    countries_raw: null,
    // ISO 3 letter code
    country: null,
    country_name: null,
    geojson: null,
    // Options include population, population density
    colorBy: 'population',
    scaleColorBy: 'logarithmic',
    fetching: false,
    fetched: false,
    layer_population: null,
    layer_pop_density: null,
    error: null,
    area: null
  }, action) {
    switch(action.type) {
      case 'countrySelected':
        var country = action.payload.country;
        return {
          ...state,
          admin_level: determine_admin_level(country, state),
          country: country,
          country_name: action.payload.country_name,
          centroid: action.payload.centroid
        }
      break;
      case 'COUNTRIES_FETCHED':
        // json list of countries with population available
        var countries_raw = action.payload.data.countries;
        var countries = process_countries(
          action,
          countries_raw,
          state.colorBy
        );
        return {
          ...state,
          countries_raw: countries_raw,
          countries: countries
        }
        break;
      case 'RECOLOR_MAP':
        // Process countries for color on Google geoChart
        countries = process_countries(
          action,
          state.countries_raw,
          action.payload.colorByValue
        );
        return {
          ...state,
          countries: countries,
          colorBy: action.payload.colorByValue
        }
        break;
        case 'RESCALE_COLOR_MAP':
          return {
            ...state,
            scaleColorBy: action.payload.scaleColorByValue
          }
          break;
      case 'COUNTRY_FETCHED':
        // var admin_level = action.payload.admin_level;
        // var country_code = action.payload.country;
        var geojson = action.payload.geojson;
        // var blob = new Blob([JSON.stringify(geojson)], {type: "data:text/json;charset=utf-8"});
        // FileSaver.saveAs(blob, country_code + '.json');
        return {
          ...state,
          // admin_level: action.payload.admin_level,
          country: action.payload.country,
          geojson: geojson,
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

function get_strength(feature, high, colorBy, scaleColorBy) {
  var pop = feature.properties[colorBy];
  if (scaleColorBy.match(/linear/)) {
    return pop/high;
  } else {
    var log = high/4;
    return pop >= log ? (pop/high) : (pop/log)
  }
}

function create_layer(colorBy, geojson, scaleColorBy) {
  var high = get_max(geojson, colorBy);
  return L.geoJSON(geojson, {
    style: (f) => {
      var strength = get_strength(f, high, colorBy, scaleColorBy)
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

// Process countries for color on Google geoChart
function process_countries(action, countries_raw, colorBy) {
  // countries_raw is raw json from api /population
  var countries = Object.keys(countries_raw).reduce((ary, c) => {
              // Singapore's pop density too high, ignore it altogether.
              if (c!=='sgp') {
                ary.push([
                  codeCountryIndex[c],
                  colorByValue(action, countries_raw, c, colorBy)
                ])
              }
            return ary;
          }, []);
          countries.unshift(['Country', colorBy]);
  return countries;
}

function parse_attribute(action, countries_raw, country, kind) {
  return parseInt(
    countries_raw[country][
      Object.keys(
        countries_raw[country]
      )[0]][0][kind], 10
    );
}

function colorByValue(action, countries_raw, country, colorBy) {
  var area = parse_attribute(action, countries_raw, country, 'sq_km');
  var population = parse_attribute(action, countries_raw, country, 'population')
  switch(colorBy) {
    case 'population':
      return population;
      break;
    case 'pop_density':
      return population/area;
      break;
    default:
      return population;
  }
}

function determine_admin_level(country_iso, state) {
  var primary_raster = Object.keys(state.countries_raw[country_iso])[0];
  return state.countries_raw[country_iso][primary_raster][0].admin_level;
}
