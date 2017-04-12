// const countryCodeIndex = require('../utils/country_codes');
const codeCountryIndex = require('../utils/codes_countries');
var FileSaver = require('file-saver');
var L = require('leaflet');

export default function reducer(state={
  // Formatted for google geo-chart
  countries: [['country']],
  dimensions: ['population', 'pop_density'],
  scales: ['linear', 'logarithmic'],
  units: ['human', 'aegypti'],
  unit: 'human',
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

  geoChart_data: {human: {}, aegypti: {}},
  // An object with keys: 'linear' and 'logarithmic'
  // layer_population: null,
  // layer_pop_density: null,
  layers: null,
  // For removing layers
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
        state.units,
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
      var layer_population_old = state.layers ? state.layers[state.unit]['population'][state.colorScaleBy] : null;
      var layer_pop_density_old = state.layers ? state.layers[state.unit]['pop_density'][state.colorScaleBy] : null;
      return {
        ...state,
        layer_population_old: layer_population_old,
        layer_pop_density_old: layer_pop_density_old,
        colorBy: action.payload.colorByValue
      }
      break;
      case 'UPDATE_UNIT':
        // Process countries for color on Google geoChart
        return {
          ...state,
          // layer_population_old: state.layer_population,
          // layer_pop_density_old: state.layer_pop_density,
          unit: action.payload.unit
        }
        break;
      case 'RESCALE_GEOCHART_COLOR':
        var layer_population_old = state.layers ? state.layers[state.unit]['population'][state.colorScaleBy] : null;
        var layer_pop_density_old = state.layers ? state.layers[state.unit]['pop_density'][state.colorScaleBy] : null;
        return {
          ...state,
          layer_population_old: layer_population_old,
          layer_pop_density_old: layer_pop_density_old,
          scaleColorBy: action.payload.scaleColorBy
        }
        break;
    case 'COUNTRY_FETCHED':
      // var admin_level = action.payload.admin_level;
      // var country_code = action.payload.country;
      var geojson = action.payload.geojson;
      // var blob = new Blob([JSON.stringify(geojson)], {type: "data:text/json;charset=utf-8"});
      // FileSaver.saveAs(blob, 'aaa' + '.json');
      var layers = state.units.reduce((h, u) => {
        h[u] = {};
        state.dimensions.forEach(d => {
          h[u][d] = {};
          state.scales.forEach(s => {
            h[u][d][s] = create_layer(u, d, s, geojson)
          })
        })
        return h;
      }, {})

      return {
        ...state,
        // admin_level: action.payload.admin_level,
        country: action.payload.country,
        geojson: geojson,
        layer_population_old: state.layer_population,
        layer_pop_density_old: state.layer_pop_density,
        layers: layers,
        // layer_population: {
        //   linear: create_layer('population', geojson, 'linear'),
        //   logarithmic: create_layer('population', geojson, 'logarithmic')
        // },
        // layer_pop_density:{
        //   linear: create_layer('pop_density', geojson, 'linear'),
        //   logarithmic: create_layer('pop_density', geojson, 'logarithmic')
        // },
        area: get_total(geojson, 'sq_km')
      };
      break;
    default:
      return state;
  }
}

function get_max(geojson, unit, dimension) {
  var max;
  geojson.features.forEach(f => {
    var value = f.properties.population[unit][dimension];
    max = max ? (value > max ? value : max) : value;
    // min = min ? (value < min ? value : min) : value;
  });
  console.log(max)
  return max;
}
// fraction is for 0..1, for leaflet opacity
function get_strength(val, high, colorBy, scaleColorBy, fraction) {
  if (scaleColorBy.match(/linear/)) {
    return fraction ? (val / high) : val;
  } else {
    var log = high/4;
    return val >= log ? (val/high) : (val/log)
  }
}

function create_layer(unit, dimension, scale, geojson) {
  var high = get_max(geojson, unit, dimension);
  return L.geoJSON(geojson, {
    style: (f) => {
      var strength = get_strength(f.properties.population[unit][dimension], high, dimension, scale, true)
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

// Need to update this right later.
function get_total(geojson, kind) {
  return geojson.features.reduce((sum, f) => {
    return sum + f.properties.population.aegypti[kind];
  }, 0)
}


function get_maximum(countries_raw, unit, dimension) {
  var countries = Object.keys(countries_raw);
  // console.log(countries.reduce((h,c) => {
  //    h[c] = parse_attribute(countries_raw, c, dimension)
  //    return h
  // }, {}))
  var max = countries.map(c => {
    if (c === 'sgp' || !countries_raw[c][unit]) {
      return 0;
    }

    return parse_attribute(countries_raw, c, unit, dimension)
  }).sort((a, b) => {
    return b - a;
  })[0]

  return max
}

// Process countries for color on Google geoChart
// units: human, aegypti
function geochart_data(countries_raw, units, dimensions, scales) {
  // countries_raw is raw json from api /population
  // {population: 1806646877, pop_density: 19970, sq_km: 3622477}
  return units.reduce((h_u, u) => {
    // hash_unit['human']
    h_u[u] = dimensions.reduce((h, d) => {
      var maximum = get_maximum(countries_raw, u, d);
      h[d] = {};
      scales.forEach(s => {
        var countries = Object.keys(countries_raw).reduce((ary, c) => {
            // Singapore's pop density too high, ignore it altogether.
            if (c!=='sgp' && countries_raw[c][u]) {
              ary.push([
                codeCountryIndex[c],
                colorByValue(countries_raw, c, u, d, s, maximum)
              ])
            }
          return ary;
        }, []);
        countries.unshift(['Country', d]);
        h[d][s] = countries;
      })
      return h
    }, {})
    return h_u;
  }, {});
}

function parse_attribute(countries_raw, country, unit, dimension) {
  // kind is population or pop_density
  // return parseInt(
  //   countries_raw[country][unit][0][dimension], 10
  //   );
    return Math.ceil(countries_raw[country][unit][0][dimension] * 10000) / 10000;
  // return parseInt(
  //   countries_raw[country][
  //     Object.keys(
  //       countries_raw[country]
  //     )[0]][0][dimension], 10
  //   );
}

function colorByValue(countries_raw, country, unit, dimension, scale, high) {
  var value = parse_attribute(countries_raw, country, unit, dimension);
  var val_strength = get_strength(value, high, dimension, scale);
  return val_strength
}


function determine_admin_level(country_iso, state) {
  var primary_raster = Object.keys(state.countries_raw[country_iso])[0];
  return state.countries_raw[country_iso][primary_raster][0].admin_level;
}
