import React, { Component } from 'react';
import { connect } from 'react-redux';
import { recolorCountries } from '../actions/countryAction';
import { updateUnit } from '../actions/countryAction';
import { Grid } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
class ColorByRadioGroup extends Component {
  constructor(params) {
     super(params)
     // initial gender state set from props
     this.state = {
       colorBy: this.props.country.colorBy,
       unit: this.props.country.unit,
     }
     this.setColorBy = this.setColorBy.bind(this)
     this.updateUnit = this.updateUnit.bind(this)
  }

  setColorBy(e) {
    this.setState({
      colorBy: e.target.value
    })
    this.props.dispatch(recolorCountries(e.target.value));
  }
  updateUnit(e) {
    this.setState({
      unit: e.target.value
    })
    this.props.dispatch(updateUnit(e.target.value));
  }
  render() {
    var colorBy = this.props.country.colorBy;
    var unit = this.props.country.unit;
    var side_style = this.props.side_style;
    var style = {width:'250px', textAlign: 'left'}
    return  <div >
      <Grid style={style}>
        <Row className="show-grid">
          <Col xs={12} md={6}><input type="radio" checked={colorBy === "population"} onChange={this.setColorBy} value="population" /> population</Col>
          <Col xs={12} md={6}><input type="radio" checked={colorBy === "pop_density"} onChange={this.setColorBy} value="pop_density"  /> pop density</Col>
        </Row>
      </Grid>
      <hr />
      <Grid style={style}>
        <Row className="show-grid">
          <Col xs={12} md={6}><input type="radio" checked={unit === "human"} onChange={this.updateUnit} value="human" /> human</Col>
          <Col xs={12} md={6}><input type="radio" checked={unit === "aegypti"} onChange={this.updateUnit} value="aegypti"  /> aegypti</Col>
        </Row>
      </Grid>
    </div>;
  }
}

export default connect(state => {
    return {};
  }
)(ColorByRadioGroup)
