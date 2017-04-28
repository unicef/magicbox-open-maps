// const countryCodeIndex = require('../utils/country_codes');
const codeCountryIndex = require('../utils/codes_countries');
var FileSaver = require('file-saver');
var L = require('leaflet');
var dimension_lookup = {
  aegypti: {
    sum: 'prevalence',
    density: 'prev_density'
  },
  human: {
    sum: 'population',
    density: 'pop_density'
  },
}
export default function reducer(state={
  // Formatted for google geo-chart
  is_loaded: false,
  countries: [['country']],
  dimensions: ['sum', 'density'],
  enrichments: ['population', 'prevalence', 'pop_density', 'prev_density'],
  enrichment: 'population',
  scales: ['linear', 'logarithmic'],
  units: ['human', 'aegypti'],
  unit: 'human',
  data_sources: null,
  // Array of countries and their meta data from api
  countries_raw: null,
  // ISO 3 letter code
  country: null,
  country_name: null,
  geojson: null,
  // Options include population, population density
  colorBy: 'sum',
  scale: 'linear',
  fetching: false,
  fetched: false,
  data_source: null,
  data_source_url: null,

  geoChart_data: {human: {}, aegypti: {}},
  // An object with keys: 'linear' and 'logarithmic'
  // For removing layers
  // layer_population_old: null,
  // layer_pop_density_old: null,
  old_layers: [],
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
        is_loaded: false
      }
    break;
    case 'COUNTRIES_FETCHED':
      // json list of countries with population available
      var countries_raw = action.payload.data.countries;
      var data_sources = action.payload.data.data_sources;
      var geoChart_data = geochart_data(
        countries_raw,
        state.units,
        state.dimensions,
        state.scales,
        dimension_lookup,
      );

      return {
        ...state,
        data_sources: data_sources,
        countries_raw: countries_raw,
        geoChart_data: geoChart_data,
        data_source: data_sources[state.unit].source,
        data_source_url: data_sources[state.unit].source_url,
        is_loaded: true
      }
      break;
    case 'RECOLOR_MAPS':
      return {
        ...state,
        enrichment: action.payload.enrichment
      }
      break;
      case 'UPDATE_UNIT':
        // Process countries for color on Google geoChart
        var unit = action.payload.unit;
        return {
          ...state,
          unit: unit,
          enrichment: unit === 'human' ? 'population' : 'prevalence',
          data_source: state.geojson ? state.geojson.data_sources[unit].source : state.data_sources[unit].source,
          data_source_url: state.geojson ? state.geojson.data_sources[unit].source_url : state.data_sources[unit].source_url,
        }
        break;
      case 'RESCALE_MAPS_COLOR':
        return {
          ...state,
          scale: action.payload.scale
        }
        break;
    case 'COUNTRY_FETCHED':
      // var admin_level = action.payload.admin_level;
      // var country_code = action.payload.country;
      var geojson = action.payload.geojson;
      // var blob = new Blob([JSON.stringify(geojson)], {type: "data:text/json;charset=utf-8"});
      // FileSaver.saveAs(blob, 'aaa' + '.json');

      // var layers = state.units.reduce((h, u) => {
      //   h[u] = {};
      //   state.dimensions.forEach(d => {
      //     h[u][d] = {};
      //     state.scales.forEach(s => {
      //       if (geojson.features[0].properties.population[u]) {
      //         h[u][d][s] = create_layer(u, d, s, geojson)
      //       }
      //     })
      //   })
      //   return h;
      // }, {})

      var layers = get_layers(state, geojson);
      return {
        ...state,
        // admin_level: action.payload.admin_level,
        data_source: geojson.data_sources[state.unit].source,
        data_source_url: geojson.data_sources[state.unit].source_url,
        country: action.payload.country,
        geojson: geojson,
        // layer_population_old: set_old_layer('population', state),
        // layer_pop_density_old: set_old_layer('pop_density', state),
        old_layers: set_old_layers(state),
        layers: layers,
        is_loaded: true,
        // layer_population: {
        //   linear: create_layer('population', geojson, 'linear'),
        //   logarithmic: create_layer('population', geojson, 'logarithmic')
        // },
        // layer_pop_density:{
        //   linear: create_layer('pop_density', geojson, 'linear'),
        //   logarithmic: create_layer('pop_density', geojson, 'logarithmic')
        // },
        area: get_total_area(geojson)
      };
      break;
    default:
      return state;
  }
}

function set_old_layers(state) {
  return state.layers ? state.layers : [];

  // return state.units.reduce((ary, u) => {
  //   state.enrichments.forEach(e => {
  //     state.scales.forEach(s => {
  //       if (state.layers[[u, e, s].join('-')]){
  //         return ary.push(state.layers[[u, e, s].join('-')])
  //       }
  //     })
  //   })
  // }, [])
}

function set_old_layer(dimension, state) {
  if (state.layers && state.layers[state.unit]) {
    return state.layers[state.unit][dimension][state.scale]
  } else {
    return null;
  }
}

function get_layers(state, geojson) {
  return state.units.reduce((h, u) => {
    state.enrichments.forEach(e => {
      if (has_value_for_unit(geojson, u, e)) {
        h[u + '-' + e + '-'  + 'linear'] = create_layer(u, e, geojson, 'linear')
        h[u + '-' + e + '-' + 'logarithmic'] = create_layer(u, e, geojson, 'logarithmic')
      }
    })
    return h;
  }, {})
}

function has_value_for_unit(geojson, unit, enrichment) {
  return geojson.features.find(f => { return f.properties[enrichment + '-' + unit]})
}

function get_high(geojson, unit, enrichment, extreme) {
  var max;
  // var min;
  geojson.features.forEach(f => {
    var value = f.properties[enrichment + '-' + unit];
    max = max ? (value >= max ? value : max) : value;
    // min = min ? (value <= min ? value : min) : value;
    // min = min ? (value < min ? value : min) : value;
  });

  return max;
}
// fraction is for 0..1, for leaflet opacity
function get_strength(val, high, scaleColorBy, fraction) {
  if (scaleColorBy.match(/linear/)) {
    return fraction ? (val / high) : val;
  } else {
    var log = high/4;
    //return val >= log ? (val/high) : (val/log)
    return Math.log(val+1)/Math.log(high+1)
  }
}

function create_layer(unit, enrichment, geojson, scale) {
  var max = get_high(geojson, unit, enrichment);
  return L.geoJSON(geojson, {
    style: (f) => {
      var strength = get_strength(f.properties[enrichment + '-' + unit], max, scale, true);
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

// function create_layer(unit, dimension, scale, geojson) {
//   var high = get_max(geojson, unit, dimension);
//   return L.geoJSON(geojson, {
//     style: (f) => {
//       var strength = get_strength(f.properties.population[unit][dimension], high, dimension, scale, true)
//       return {
//         fillColor: 'red',
//         color: 'black',
//         weight: 0.1,
//         dashArray: '3',
//         opacity: 0.65,
//         fillOpacity: strength
//       }
//     }
//   })
// }


function get_total_area(geojson) {
  return geojson.features.reduce((sum, f) => {
    return sum + f.properties.sq_km;
  }, 0)
}


function get_maximum(countries_raw, unit, dimension) {
  var countries = Object.keys(countries_raw);

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
function geochart_data(countries_raw, units, dimensions, scales, dimension_lookup) {
  // countries_raw is raw json from api /population
  // {population: 1806646877, pop_density: 19970, sq_km: 3622477}
  return units.reduce((h_u, u) => {
    // hash_unit['human']
    h_u[u] = dimensions.reduce((h, d) => {
      var maximum = get_maximum(countries_raw, u, d);
      h[dimension_lookup[u][d]] = {};
      scales.forEach(s => {
        var countries = Object.keys(countries_raw).reduce((ary, c) => {
            // Singapore's pop density too high, ignore it altogether.
            if (c!=='sgp' && countries_raw[c][u]) {
              var value = colorByValue(countries_raw, c, u, d, s, maximum);
              if (codeCountryIndex[c]) {
                ary.push([
                  codeCountryIndex[c],
                  colorByValue(countries_raw, c, u, d, s, maximum)
                ])

              }
            }
          return ary;
        }, []);
        // if (u.match(/aegypti/) && d.match(/density/)) {
        //   countries.forEach(e => {
        //     e[1] = e[1] * 1000;
        //
        //     console.log(e)
        //   })
        // }

        countries.unshift(['Country', dimension_lookup[u][d]]);
        h[dimension_lookup[u][d]][s] = countries;
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
  var val_strength = get_strength(value, high, scale);
  return val_strength
}


function determine_admin_level(country_iso, state) {
  var primary_raster = Object.keys(state.countries_raw[country_iso])[0];
  return state.countries_raw[country_iso][primary_raster][0].admin_level;
}
