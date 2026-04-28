// Custom A-Frame components for Aurora E1 VR Experience

// Makes an entity always face the camera rig
AFRAME.registerComponent('look-at', {
  schema: { type: 'selector' },
  tick: function () {
    if (!this.data) return;
    const targetPos = new THREE.Vector3();
    this.data.object3D.getWorldPosition(targetPos);
    this.el.object3D.lookAt(targetPos);
  }
});

// Animates the fade overlay opacity via A-Frame's animation system workaround
// (direct material property animation through JS for reliable cross-browser behaviour)
AFRAME.registerComponent('fade-controller', {
  init: function () {
    this.mesh = null;
    this.el.addEventListener('object3dset', () => {
      this.mesh = this.el.getObject3D('mesh');
    });
  },
  setOpacity: function (val) {
    const mesh = this.el.getObject3D('mesh');
    if (mesh) {
      mesh.material.opacity = val;
      mesh.material.transparent = true;
    }
  }
});

// Pulses a hotspot's scale continuously after being set up
AFRAME.registerComponent('pulse', {
  schema: {
    min: { default: 1.0 },
    max: { default: 1.2 },
    dur: { default: 1200 }
  },
  init: function () {
    this._start = null;
    this._bound = this._tick.bind(this);
    this.el.sceneEl.addEventListener('renderstart', this._bound);
  },
  _tick: function () {
    const now = performance.now();
    if (!this._start) this._start = now;
    const t = ((now - this._start) % (this.data.dur * 2)) / (this.data.dur * 2);
    const ping = Math.abs(t * 2 - 1); // triangle wave 0→1→0
    const s = this.data.min + (this.data.max - this.data.min) * ping;
    this.el.object3D.scale.set(s, s, s);
  },
  remove: function () {
    this.el.sceneEl.removeEventListener('renderstart', this._bound);
  }
});

// Attaches an entity to a parent and keeps it at a fixed local offset
// Used to keep the info panel in front of the camera
AFRAME.registerComponent('camera-attached', {
  schema: {
    offset: { type: 'vec3', default: { x: 0, y: 0, z: -2 } }
  },
  tick: function () {
    const camera = document.getElementById('rig');
    if (!camera) return;
    const pos = new THREE.Vector3(
      this.data.offset.x,
      this.data.offset.y,
      this.data.offset.z
    );
    pos.applyQuaternion(camera.object3D.quaternion);
    pos.add(camera.object3D.position);
    this.el.object3D.position.copy(pos);
    this.el.object3D.quaternion.copy(camera.object3D.quaternion);
  }
});
