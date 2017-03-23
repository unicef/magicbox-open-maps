const countryCodeIndex = require('../utils/country_codes');
var FileSaver = require('file-saver');

export default function reducer(state={
    countries: [['country']],
    countries_raw: null,
    country: null,
    colorBy: 'population',
    fetching: false,
    fetched: false,
    error: null,
  }, action) {
    switch(action.type) {
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
        var geojson = action.payload.response.data;
        var blob = new Blob([JSON.stringify(geojson)], {type: "data:text/json;charset=utf-8"});
        FileSaver.saveAs(blob, country_code + '.json');
        return {
          ...state,
          country: action.payload
        };
        break;
      default:
        return state;
    }
  }

function process_countries(action, countries_raw, colorBy) {
  var countries = Object.keys(countries_raw).reduce((ary, c) => {
              // Singapore's pop density too high, ignore it altogether.
              if (c!=='sgp') {
                ary.push([
                  countryCodeIndex[c],
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
    case 'density':
      return population/area;
      break;
    default:
      return population;
  }
}
