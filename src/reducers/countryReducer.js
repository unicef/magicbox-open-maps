// const countryCodeIndex = require('../utils/country_codes');
const codeCountryIndex = require('../utils/codes_countries');
var FileSaver = require('file-saver');

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
    fetching: false,
    fetched: false,
    error: null,
    area: null
  }, action) {
    switch(action.type) {
      case 'countrySelected':
        return {
          ...state,
          country: action.payload.country,
          country_name: action.payload.country_name,
          centroid: action.payload.centroid
        }
      break;
      case 'COUNTRIES_FETCHED':
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
      case 'COUNTRY_FETCHED':
        var country_code = action.payload.country;
        var geojson = action.payload.geojson;
        // var blob = new Blob([JSON.stringify(geojson)], {type: "data:text/json;charset=utf-8"});
        // FileSaver.saveAs(blob, country_code + '.json');
        return {
          ...state,
          country: action.payload.country,
          geojson: action.payload.geojson,
          area: get_total(geojson, 'sq_km')
        };
        break;
      default:
        return state;
    }
  }

  function get_total(geojson, kind) {
    return geojson.features.reduce((sum, f) => {
      return sum + f.properties[kind];
    }, 0)
  }

function process_countries(action, countries_raw, colorBy) {
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
