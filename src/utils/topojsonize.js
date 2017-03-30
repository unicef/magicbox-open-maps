var topojson = require('topojson');
var g = require('../download_admin_shapefiles_and_import_geojson_to_elasticsearch/data/gadm2-8/AFG_2')
var jsonfile = require('jsonfile');
function save_topojson(feature_collection) {
  return new Promise(function(resolve, reject) {
    // root is directory where topojson will be stored.
    var c = topojson.topology(
      {collection: feature_collection},
      {
        'property-transform': function(object) {
          return object.properties
          // return _.pick(
          //   object.properties,
          //   ['country_code', 'name', 'admin_code', 'geo_area_sqkm', 'pub_src']
          // );
        }
      });
    var unsimplified = JSON.parse(JSON.stringify(c));  // copy data
    topojson.simplify(c, {
      'coordinate-system': 'spherical',
      'retain-proportion': 0.4
    });
    console.log(JSON.stringify(c))
    process.exit();
  });
}

save_topojson(g).then(r => { console.log('aaa');console.log(r)})

/**
 * Read geojson file
 *
 * @param{string} geojson - geojson file with path
 * @param{bool} verbose - Option to display debug
 * @return{Promise} Fulfilled when geojson is returned.
 */
function read_jsonfile(geojson, verbose) {
  console.log(geojson)
  return new Promise(function(resolve, reject) {
    jsonfile.readFile(geojson, function(err, feature_collection) {
      if (err) {
        return reject(err);
      }

      if (verbose) {
        console.log('file read');
      }
      resolve(feature_collection);
    });
  });
}
