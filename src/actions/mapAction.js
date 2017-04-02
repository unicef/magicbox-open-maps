var config = require('../../config');

export function recordZoom(zoom_level, latLng) {
  return function(dispatch) {
    dispatch({
      type: 'ZOOM_LEVEL_RECORDED',
      payload: {
        zoom_level: zoom_level,
        latLng: [latLng.lat, latLng.lng]
      }
    })
  }
}

export function setPanLocation(latLng) {
  return function(dispatch) {
    dispatch({
      type: 'MAP_LOCATION_SET',
      payload: {
        latLng: [latLng.lat, latLng.lng],
      }
    })
  }
}
