import {Chart} from 'react-google-charts';
import { connect } from 'react-redux';
import React from 'react';
import { fetchCountry } from '../actions/countryAction';
var country_codes = require('../utils/country_codes')
var country_codes_base_2  = reverse_hash(country_codes);


class GeoChart extends React.Component {
  onChange = Chart => {
    const selectedCountryIndex = Chart.chart.getSelection()
    var iso_3_country = country_codes_base_2[
      this.props.countries[
        selectedCountryIndex[0].row + 1
      ][0]
    ];
    console.log(iso_3_country)
    this.props.dispatch(fetchCountry(iso_3_country));
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
    return (
      <div className={'my-pretty-chart-container'}>
        <Chart
          chartType="GeoChart"
          data={ this.props.countries }
          options={{}}
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

function reverse_hash(hash) {
  return Object.keys(hash).reduce((h,k) => {
    h[hash[k]] = k;
    return h;
  }, {})
}

export default connect(state => {
    return {};
  }
)(GeoChart)
