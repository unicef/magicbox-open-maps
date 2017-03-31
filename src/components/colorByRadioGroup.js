import React, { Component } from 'react';
import { connect } from 'react-redux';
import { recolorCountries } from '../actions/countryAction';

class ColorByRadioGroup extends Component {
  constructor(params) {
     super(params)
     // initial gender state set from props
     this.state = {
       colorBy: this.props.country.colorBy,
     }
     this.setColorBy = this.setColorBy.bind(this)
  }

  setColorBy(e) {
    this.setState({
      colorBy: e.target.value
    })
    this.props.dispatch(recolorCountries(e.target.value));
  }

  render() {
    var colorBy = this.props.country.colorBy;
    var countryName = this.props.country.country_name;
    var side_style = this.props.side_style;
    return  <div >
        <div>
          <p style={side_style}>
            <input type="radio" checked={colorBy === "population"} onChange={this.setColorBy} value="population" /> population
          </p>
          <p style={side_style}>
            <input type="radio" checked={colorBy === "pop_density"} onChange={this.setColorBy} value="pop_density"  /> population density
          </p>
          <p style={side_style}>
            {countryName} &nbsp; {this.props.country.admin_level}
          </p>
        </div>
      </div>;
  }
}

export default connect(state => {
    return {};
  }
)(ColorByRadioGroup)
