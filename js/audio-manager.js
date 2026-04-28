// Audio Manager — handles ambient loops, narration, and SFX

const AudioManager = (() => {
  let _muted = sessionStorage.getItem('aurora_muted') === '1';

  const _ambientEl = () => document.getElementById('ambient-audio');
  const _narrationEl = () => document.getElementById('narration-audio');

  let _currentAmbientSrc = null;
  let _narrationTimer = null;

  // Cross-fade ambient if the source changes
  function setAmbient(src) {
    if (!src) return;
    const el = _ambientEl();
    if (!el) return;

    if (src === _currentAmbientSrc) return;
    _currentAmbientSrc = src;

    const soundComp = el.components.sound;
    if (soundComp && soundComp.pool) {
      try { soundComp.stopSound(); } catch (e) {}
    }

    el.setAttribute('sound', {
      src: src,
      loop: true,
      volume: _muted ? 0 : 0.4,
      autoplay: true
    });

    // Re-apply after attribute set (A-Frame sound resets on setAttribute)
    requestAnimationFrame(() => {
      const sc = el.components.sound;
      if (sc) {
        try { sc.playSound(); } catch (e) {}
        if (_muted && sc.pool) sc.pool.children.forEach(n => { n.volume = 0; });
      }
    });
  }

  // Play narration once, after a delay
  function playNarration(src, delay = 1000) {
    if (_narrationTimer) {
      clearTimeout(_narrationTimer);
      _narrationTimer = null;
    }
    if (!src) return;

    const el = _narrationEl();
    if (!el) return;

    // Stop current narration
    const sc = el.components.sound;
    if (sc && sc.pool) {
      try { sc.stopSound(); } catch (e) {}
    }

    _narrationTimer = setTimeout(() => {
      el.setAttribute('sound', {
        src: src,
        loop: false,
        volume: _muted ? 0 : 1.0,
        autoplay: true
      });
      requestAnimationFrame(() => {
        const sc2 = el.components.sound;
        if (sc2) {
          try { sc2.playSound(); } catch (e) {}
        }
      });
    }, delay);
  }

  function playClick() {
    _playOnce('assets/audio/click.mp3', 0.6);
  }

  function playWhoosh() {
    _playOnce('assets/audio/transition-whoosh.mp3', 0.8);
  }

  function _playOnce(src, volume) {
    if (_muted) return;
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  }

  function setMuted(val) {
    _muted = val;
    sessionStorage.setItem('aurora_muted', val ? '1' : '0');

    const ambSc = _ambientEl()?.components?.sound;
    if (ambSc && ambSc.pool) {
      ambSc.pool.children.forEach(n => { n.volume = val ? 0 : 0.4; });
    }

    const narSc = _narrationEl()?.components?.sound;
    if (narSc && narSc.pool) {
      narSc.pool.children.forEach(n => { n.volume = val ? 0 : 1.0; });
    }
  }

  function isMuted() { return _muted; }

  return { setAmbient, playNarration, playClick, playWhoosh, setMuted, isMuted };
})();
