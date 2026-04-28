// Hotspot Builder — creates A-Frame entities from scenes.json data

const HotspotManager = (() => {
  let _infoPanelTimer = null;

  function buildHotspots(hotspots) {
    const container = document.getElementById('hotspot-container');
    if (!container) return;

    hotspots.forEach(hs => {
      const el = _createHotspot(hs);
      if (el) container.appendChild(el);
    });
  }

  function _createHotspot(hs) {
    switch (hs.type) {
      case 'info': return _buildInfo(hs);
      case 'navigation': return _buildNav(hs);
      case 'cta': return _buildCta(hs);
      default: return null;
    }
  }

  function _buildInfo(hs) {
    const wrap = document.createElement('a-entity');
    wrap.setAttribute('class', 'clickable hotspot-info');
    wrap.setAttribute('position', hs.position);
    wrap.setAttribute('look-at', '#rig');
    wrap.setAttribute('data-hotspot-id', hs.id);

    // Outer ring
    const ring = document.createElement('a-entity');
    ring.setAttribute('geometry', 'primitive: ring; radiusInner: 0.12; radiusOuter: 0.18');
    ring.setAttribute('material', 'color: #FFFFFF; shader: flat; opacity: 0.9');
    ring.setAttribute('pulse', 'min: 1.0; max: 1.2; dur: 1200');

    // Inner dot
    const dot = document.createElement('a-circle');
    dot.setAttribute('radius', '0.06');
    dot.setAttribute('color', '#4FC3F7');
    dot.setAttribute('material', 'shader: flat; opacity: 0.95');
    dot.setAttribute('position', '0 0 0.001');

    // Label text (below hotspot)
    const label = document.createElement('a-text');
    label.setAttribute('value', hs.label);
    label.setAttribute('position', '0 -0.28 0');
    label.setAttribute('align', 'center');
    label.setAttribute('color', '#FFFFFF');
    label.setAttribute('width', '2');
    label.setAttribute('font', 'exo2bold');

    wrap.appendChild(ring);
    wrap.appendChild(dot);
    wrap.appendChild(label);

    wrap.addEventListener('click', () => _onInfoClick(hs));
    wrap.addEventListener('mouseenter', () => _highlightOn(ring));
    wrap.addEventListener('mouseleave', () => _highlightOff(ring));

    return wrap;
  }

  function _buildNav(hs) {
    const wrap = document.createElement('a-entity');
    wrap.setAttribute('class', 'clickable hotspot-nav');
    wrap.setAttribute('position', hs.position);
    wrap.setAttribute('data-target-scene', hs.targetScene);

    // Cone arrow pointing forward (−Z)
    const cone = document.createElement('a-entity');
    cone.setAttribute('geometry', 'primitive: cone; radiusBottom: 0.25; radiusTop: 0.01; height: 0.4');
    cone.setAttribute('material', 'color: #4FC3F7; shader: flat; opacity: 0.9');
    cone.setAttribute('rotation', '-90 0 0');

    // Bobbing animation on the wrapper
    const posStr = hs.position.split(' ');
    const bx = parseFloat(posStr[0]);
    const by = parseFloat(posStr[1]);
    const bz = parseFloat(posStr[2]);
    wrap.setAttribute('animation__bob',
      `property: position; from: ${bx} ${by} ${bz}; to: ${bx} ${by + 0.15} ${bz}; dir: alternate; loop: true; dur: 1500; easing: easeInOutSine`);

    const text = document.createElement('a-text');
    text.setAttribute('value', hs.label.toUpperCase());
    text.setAttribute('position', '0 -0.5 0');
    text.setAttribute('align', 'center');
    text.setAttribute('color', '#FFFFFF');
    text.setAttribute('width', '3');

    wrap.appendChild(cone);
    wrap.appendChild(text);

    wrap.addEventListener('click', () => {
      AudioManager.playClick();
      setTimeout(() => {
        AudioManager.playWhoosh();
        SceneManager.loadScene(hs.targetScene);
      }, 200);
    });

    return wrap;
  }

  function _buildCta(hs) {
    const wrap = document.createElement('a-entity');
    wrap.setAttribute('class', 'clickable hotspot-cta');
    wrap.setAttribute('position', hs.position);
    wrap.setAttribute('look-at', '#rig');
    wrap.setAttribute('data-cta-url', hs.ctaUrl || '');

    const bg = document.createElement('a-entity');
    bg.setAttribute('geometry', 'primitive: plane; width: 1.8; height: 0.6');
    bg.setAttribute('material', 'color: #FFB300; shader: flat');

    const btnText = document.createElement('a-text');
    btnText.setAttribute('value', hs.label.toUpperCase());
    btnText.setAttribute('position', '0 0 0.01');
    btnText.setAttribute('align', 'center');
    btnText.setAttribute('color', '#000000');
    btnText.setAttribute('width', '3.5');
    btnText.setAttribute('font', 'exo2bold');

    // Pulsing glow ring around CTA
    const ring = document.createElement('a-entity');
    ring.setAttribute('geometry', 'primitive: ring; radiusInner: 0.95; radiusOuter: 1.0');
    ring.setAttribute('material', 'color: #FFB300; shader: flat; opacity: 0.4');
    ring.setAttribute('pulse', 'min: 1.0; max: 1.08; dur: 1800');

    wrap.appendChild(bg);
    wrap.appendChild(btnText);
    wrap.appendChild(ring);

    wrap.addEventListener('click', () => _onCtaClick(hs));

    return wrap;
  }

  function _onInfoClick(hs) {
    AudioManager.playClick();
    showInfoPanel(hs.label, hs.description);
  }

  function _onCtaClick(hs) {
    AudioManager.playClick();
    showInfoPanel('Reserved! ✓', 'Thank you! Your test drive request has been received. Our team will contact you shortly.');
    // After 6 seconds, show the "Drive the Future" confirmation
    if (_infoPanelTimer) clearTimeout(_infoPanelTimer);
    _infoPanelTimer = setTimeout(() => {
      showInfoPanel('Aurora E1', 'Drive the future. See you at the showroom.');
    }, 6000);
  }

  function showInfoPanel(title, description) {
    const panel = document.getElementById('info-panel');
    const titleEl = document.getElementById('info-title');
    const descEl = document.getElementById('info-desc');
    if (!panel || !titleEl || !descEl) return;

    titleEl.setAttribute('value', title);
    descEl.setAttribute('value', _wrapText(description, 38));

    panel.setAttribute('visible', true);

    if (_infoPanelTimer) clearTimeout(_infoPanelTimer);
    _infoPanelTimer = setTimeout(() => hideInfoPanel(), 5000);
  }

  function hideInfoPanel() {
    const panel = document.getElementById('info-panel');
    if (panel) panel.setAttribute('visible', false);
  }

  // Simple word-wrap for A-Frame text (no native wrapping for long strings)
  function _wrapText(text, maxChars) {
    const words = text.split(' ');
    let line = '';
    const lines = [];
    words.forEach(w => {
      if ((line + w).length > maxChars) {
        lines.push(line.trim());
        line = '';
      }
      line += w + ' ';
    });
    if (line.trim()) lines.push(line.trim());
    return lines.join('\n');
  }

  function _highlightOn(ring) {
    ring.setAttribute('material', 'color: #4FC3F7; shader: flat; opacity: 1.0');
  }

  function _highlightOff(ring) {
    ring.setAttribute('material', 'color: #FFFFFF; shader: flat; opacity: 0.9');
  }

  return { buildHotspots, showInfoPanel, hideInfoPanel };
})();
