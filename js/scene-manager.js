// Scene Manager — loads scenes.json, drives transitions, builds hotspots

const SceneManager = (() => {
  let _scenes = {};
  let _currentScene = null;
  let _transitioning = false;
  let _durationTimer = null;

  async function loadScenes() {
    const resp = await fetch('data/scenes.json');
    const data = await resp.json();
    data.scenes.forEach(s => { _scenes[s.id] = s; });
  }

  function loadScene(sceneId) {
    if (_transitioning) return;
    const scene = _scenes[sceneId];
    if (!scene) { console.warn('Scene not found:', sceneId); return; }

    if (_currentScene === null) {
      // First load — no fade needed
      _applyScene(scene);
    } else {
      _transitioning = true;
      fadeOut(() => {
        _applyScene(scene);
        fadeIn();
        _transitioning = false;
      });
    }
  }

  function _applyScene(scene) {
    _currentScene = scene.id;

    // Swap sky
    const sky = document.getElementById('dynamic-sky');
    if (sky) sky.setAttribute('src', scene.skyImage);

    // Clear previous hotspots
    clearHotspots();

    // Hide info panel from previous scene
    HotspotManager.hideInfoPanel();

    // Build new hotspots
    HotspotManager.buildHotspots(scene.hotspots || []);

    // Audio
    AudioManager.setAmbient(scene.ambientAudio);
    AudioManager.playNarration(scene.narrationAudio, 1000);

    // Update subtitles / narration text HUD
    _updateNarrationHUD(scene.narrationText);

    // Clear any existing duration reminder
    if (_durationTimer) clearTimeout(_durationTimer);
    if (scene.duration) {
      _durationTimer = setTimeout(() => {
        _flashNavHotspot();
      }, scene.duration * 1000);
    }

    // Update progress indicator
    _updateSceneIndicator(scene.id);
  }

  function fadeOut(callback) {
    const overlay = document.getElementById('fade-overlay');
    if (!overlay) { callback(); return; }

    overlay.setAttribute('material', 'color: black; side: back; opacity: 0; transparent: true');

    let opacity = 0;
    const step = 0.05;
    const interval = setInterval(() => {
      opacity = Math.min(opacity + step, 1);
      overlay.setAttribute('material', `color: black; side: back; opacity: ${opacity}; transparent: true`);
      if (opacity >= 1) {
        clearInterval(interval);
        callback();
      }
    }, 40); // ~25fps fade over 800ms
  }

  function fadeIn() {
    const overlay = document.getElementById('fade-overlay');
    if (!overlay) return;

    let opacity = 1;
    const step = 0.05;
    const interval = setInterval(() => {
      opacity = Math.max(opacity - step, 0);
      overlay.setAttribute('material', `color: black; side: back; opacity: ${opacity}; transparent: true`);
      if (opacity <= 0) {
        clearInterval(interval);
      }
    }, 40);
  }

  function clearHotspots() {
    const container = document.getElementById('hotspot-container');
    if (!container) return;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  // After scene duration, gently highlight the nav hotspot
  function _flashNavHotspot() {
    const navHotspot = document.querySelector('.hotspot-nav');
    if (!navHotspot) return;
    navHotspot.setAttribute('animation__attention',
      'property: scale; from: 1 1 1; to: 1.4 1.4 1.4; dir: alternate; loop: true; dur: 600');
  }

  function _updateNarrationHUD(text) {
    const hud = document.getElementById('narration-hud');
    if (!hud) return;
    hud.setAttribute('value', text || '');
    hud.parentEl && hud.parentEl.setAttribute('visible', !!text);
  }

  function _updateSceneIndicator(sceneId) {
    const sceneIds = Object.keys(_scenes);
    const idx = sceneIds.indexOf(sceneId);
    const total = sceneIds.length;
    const indicator = document.getElementById('scene-indicator');
    if (indicator) {
      indicator.setAttribute('value', `${idx + 1} / ${total}`);
    }
  }

  function getScene(id) { return _scenes[id]; }
  function getCurrentSceneId() { return _currentScene; }

  return { loadScenes, loadScene, fadeOut, fadeIn, clearHotspots, getScene, getCurrentSceneId };
})();

// Boot sequence — runs after A-Frame scene is ready
document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  if (!scene) return;

  scene.addEventListener('loaded', async () => {
    await SceneManager.loadScenes();
    SceneManager.loadScene('scene1-showroom');
  });
});
