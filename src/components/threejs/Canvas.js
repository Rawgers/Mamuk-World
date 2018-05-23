import React, {Component} from 'react';
import * as THREE from 'three';

import ModifiedFlyControls from './lib/ModifiedFlyControls';
import UniverseView from './view/UniverseView';
import {DEFAULT_NEAR, DEFAULT_FAR} from './constants';

export default class Canvas extends Component {
  componentDidMount() {
    this.renderer = new THREE.WebGLRenderer(
      {canvas: this.canvas, antialias: true, alpha: true}
    );
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.currentView = new UniverseView(
      this.renderer,
      new THREE.Scene(),
      new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, DEFAULT_NEAR, DEFAULT_FAR),
      ModifiedFlyControls
    );
  }

  render() {
    return (
      <canvas
        ref={element => {this.canvas = element}}
        style={{
          width: '100%',
          height: '100%'
        }}>
      </canvas>
    );
  }
}
