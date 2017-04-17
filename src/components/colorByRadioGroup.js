import React, { Component } from 'react';
import { connect } from 'react-redux';
import { recolorCountries } from '../actions/countryAction';
import { updateUnit } from '../actions/countryAction';
import { rescaleColorCountries } from '../actions/countryAction';
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
     this.setEnrichment = this.setEnrichment.bind(this)
     this.updateUnit = this.updateUnit.bind(this)
     this.setScale = this.setScale.bind(this)
  }

  setScale(e) {
    this.setState({
      scale: e.target.value
    })
    this.props.dispatch(rescaleColorCountries(e.target.value));
  }

  setEnrichment(e) {
    this.setState({
      enrichment: e.target.value,
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

    function is_visible(country, countries, kind) {
      if (!country) {
        return 'inline';
      }
      return countries[country][kind] ? 'inline' : 'none';
    }

    var country = this.props.country.country;
    var countries_raw = this.props.country.countries_raw;
    var enrichment = this.props.country.enrichment;
    var unit = this.props.country.unit;
    var style = {
      width:'250px',
      textAlign: 'left',
      fontSize:'14px'
    }


    var visible_human = is_visible(country, countries_raw, 'human');
    var visible_population = (unit === 'human') ? 'inline' : 'none';
    var visible_prevalence = unit !== 'human' ? 'inline' : 'none';
    var scale = this.props.country.scale;
    var style_human = {display: visible_human};
    var style_population = {...style, display: visible_population};
    var style_prevalence = {...style, display: visible_prevalence};
    var no_display = {display: 'none'};

    return  <div >
      <Grid style={style}>
        <Row className="show-grid">
          <Col xs={12} md={6} ><span style={style_human}><input type="radio" checked={unit === "human"} onChange={this.updateUnit} value="human" /> human</span></Col>
          <Col xs={12} md={6}><input type="radio" checked={unit === "aegypti"} onChange={this.updateUnit} value="aegypti"  /> aegypti</Col>
        </Row>
      </Grid>
      <hr />
      <Grid style={style}>
        <Row className="show-grid">
          <Col xs={12} md={6} style={style_population}><input type="radio" checked={enrichment === "population"} onChange={this.setEnrichment} value="population" /> population</Col>
          <Col xs={12} md={6} style={style_population}><input type="radio" checked={enrichment === "pop_density"} onChange={this.setEnrichment} value="pop_density"  /> pop density</Col>
        </Row>
        <Row className="show-grid">
          <Col xs={12} md={6} style={style_prevalence}><input type="radio" checked={enrichment === "prevalence"} onChange={this.setEnrichment} value="prevalence" /> prevalence</Col>
          <Col xs={12} md={6} style={no_display}><input type="radio" checked={enrichment === "prev_density"} onChange={this.setEnrichment} value="prev_density"  />prev density</Col>
        </Row>
      </Grid>
      <hr/>
        <Grid style={style}>
          <Row className="show-grid">
            <Col xs={12} md={6}>
              <input type='radio' checked={scale === "linear"} onChange={this.setScale} value="linear" /> linear
            </Col>
            <Col xs={12} md={6}>
              <input type='radio' checked={scale === "logarithmic"} onChange={this.setScale} value='logarithmic'  /> logarithmic
            </Col>
          </Row>
        </Grid>
    </div>;
  }
}

export default connect(state => {
    return {};
  }
)(ColorByRadioGroup)
