import React, {Component} from 'react';
import {connect} from 'react-redux';

import ThreeEntryPoint from '../components/ThreeEntryPoint';
import UniverseInterface from '../components/Interfaces/UniverseInterface';

import {changeView} from '../redux/modules/currentView';

class Exploratorium extends Component {
  render() {
    return (
      <div>
        <ThreeEntryPoint
          currentView={this.props.currentView}
          changeView={this.props.changeView}
        />
      <UniverseInterface changeView={this.props.changeView} />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentView: state.currentView
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeView: () => {
      dispatch(changeView)
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Exploratorium);
