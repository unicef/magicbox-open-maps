import {Chart} from 'react-google-charts'
import { connect } from 'react-redux';
import React from 'react';
import { fetchCountry } from '../actions/countryAction';
import { displayCountry } from '../actions/countryAction';
var config = require('../../config');

class GeoChart extends React.Component {

  onChange = Chart => {
    const selectedCountryIndex = Chart.chart.getSelection()
    var country_name =
      this.props.geoChart_data[this.props.colorBy][this.props.scaleColorBy][
        selectedCountryIndex[0].row + 1
      ][0]
    this.props.dispatch(displayCountry(country_name));
    this.props.dispatch(fetchCountry(country_name));
  }

  constructor(props){
    super(props)
    this.chartEvents=[
      {
        eventName : 'select',
        callback  : this.onChange.bind(this)
      }
    ]
  }

  render() {
    var countries = this.props.geoChart_data;
    var dimension = this.props.colorBy;
    var scale = this.props.scaleColorBy;

    return (
      <div className={'my-pretty-chart-container'}>
        <Chart
          chartType="GeoChart"
          data={ countries[dimension][scale] }
          options={{colorAxis: {colors: [ "#ffff00", "#fffd01", "#fffb03", "#fff905", "#fff806", "#fff608", "#fff40a", "#fff10d", "#ffef0f", "#ffee11", "#ffec12", "#ffea14", "#ffe816", "#ffe519", "#ffe31b", "#ffe21c", "#ffe01e", "#ffde20", "#ffdd22", "#ffdb23", "#ffd727", "#ffd628", "#ffd42a", "#ffd22c", "#ffd12d", "#ffcf2f", "#ffcc33", "#ffca31", "#ffc82f", "#ffc62d", "#ffc52c", "#ffc32a", "#ffc128", "#ffbe25", "#ffbc23", "#ffbb22", "#ffb920", "#ffb71e", "#ffb51c", "#ffb219", "#ffb017", "#ffaf16", "#ffad14", "#ffab12", "#ffaa11", "#ffa80f", "#ffa40b", "#ffa30a", "#ffa108", "#ff9f06", "#ff9e05", "#ff9c03", "#ff9900",      "#ff9503", "#ff9206", "#ff8e0a", "#ff8b0d", "#ff8811", "#ff8414", "#ff7d1b", "#ff7a1e", "#ff7722", "#ff7325", "#ff7028", "#ff6c2c", "#ff6633", "#ff6236", "#ff5f39", "#ff5b3d", "#ff5840", "#ff5544", "#ff5147", "#ff4a4e", "#ff4751", "#ff4455", "#ff4058", "#ff3d5b", "#ff395f", "#ff3366",   "#f83367", "#f13369", "#ea336b", "#e3336c", "#dd336e", "#d63370", "#c83373", "#c13375", "#bb3377", "#b43378", "#ad337a", "#a6337c", "#99337f", "#923381", "#8b3382", "#843384", "#7d3386", "#773388", "#703389", "#62338d", "#5b338e", "#553390", "#4e3392", "#473393", "#403395", "#333399"]}}}
          graph_id="GeoChart"
          width="100%"
          height="400px"
          legend_toggle
          chartEvents={this.chartEvents}
        />
      </div>
    );
  }
};

export default connect(state => {
    return {};
  }
)(GeoChart)
