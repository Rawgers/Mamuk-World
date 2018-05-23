import React, {Component} from 'react';
import Canvas from './threejs/Canvas.js';

export default class ThreeEntryPoint extends Component {
  // componentDidMount() {
  //   ThreeEntryPoint(this.threeRootElement);
  // }

  render() {
    return (
      <div>
        <Canvas />
      </div>
    );
  }
}
