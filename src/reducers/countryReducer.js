const countryCodeIndex = require('../utils/country_codes');
var FileSaver = require('file-saver');

export default function reducer(state={
    countries: [['country']],
    country: null,
    fetching: false,
    fetched: false,
    error: null,
  }, action) {
    switch(action.type) {
      case 'COUNTRIES_FETCHED':
        var countries = Object.keys(action.payload.data.countries).map(c => {
          return [
            countryCodeIndex[c],
            parseInt(
              action.payload.data.countries[c][
                Object.keys(
                  action.payload.data.countries[c]
                )[0]][0]['gadm2-8'], 10
              )
          ]
        });
        countries.unshift(['Country', 'admin level']);
        return {
          ...state,
          countries: countries
        }
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
