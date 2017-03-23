import React, { Component } from 'react';
import { connect } from 'react-redux';
import { recolorCountries } from '../actions/countryAction';

class ColorByRadioGroup extends Component {
  constructor(params) {
     super(params)
     // initial gender state set from props
     this.state = {
       colorBy: this.props.colorBy
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
    const {colorBy} = this.state
    return  <div>
        <div>
          <p>
            <input type="radio" checked={colorBy === "population"} onChange={this.setColorBy} value="population" /> population
          </p>
          <p>
            <input type="radio" checked={colorBy === "density"} onChange={this.setColorBy} value="density"  /> population density
          </p>
        </div>
      </div>;
  }
}

export default connect(state => {
    return {};
  }
)(ColorByRadioGroup)
