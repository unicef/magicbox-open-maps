export default function reducer(state={
  latLng: [51.505, -0.09],
  zoom_level: 6
}, action) {
  switch(action.type) {
    case 'ZOOM_LEVEL_RECORDED':
      return {
        ...state,
        zoom_level: action.payload.zoom_level,
        latLng: action.payload.latLng
      }
    break;
    case 'MAP_LOCATION_SET':
      return {
        ...state,
        latLng: action.payload.latLng
      }
      break;
      case 'COUNTRY_SELECTED':
        return {
          ...state,
          latLng: action.payload.latLng
        }
        break;

    default:
      return state;
  }
}
