import React, {Component} from 'react';

export default class UniverseInterface extends Component {
  handleClick(e) {
    // TODO: Route
  }
  render() {
    return(
      <i className="far fa-star" onClick={this.handleClick}></i>
    )
  }
}
