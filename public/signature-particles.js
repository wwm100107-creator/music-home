(() => {
  'use strict';

  const button = document.getElementById('playerSignatureParticles');
  const canvas = document.getElementById('playerSignatureCanvas');
  if (!button || !canvas) return;

  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!context) return;

  const image = new Image();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const particles = [];
  const inkColor = [250, 245, 221];
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let frame = 0;
  let pointer = null;
  let imageReady = false;

  class Particle {
    constructor(x, y, alpha) {
      this.targetX = x;
      this.targetY = y;
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.alpha = alpha;
      this.size = 0.72 + Math.random() * 0.62;
      this.spring = 0.105 + Math.random() * 0.035;
      this.friction = 0.76 + Math.random() * 0.08;
    }

    update() {
      let dx = this.targetX - this.x;
      let dy = this.targetY - this.y;
      this.vx += dx * this.spring;
      this.vy += dy * this.spring;

      if (pointer) {
        const awayX = this.x - pointer.x;
        const awayY = this.y - pointer.y;
        const distance = Math.hypot(awayX, awayY);
        const radius = 15;
        if (distance > 0.01 && distance < radius) {
          const force = (radius - distance) / radius;
          this.vx += (awayX / distance) * force * 1.8;
          this.vy += (awayY / distance) * force * 1.8;
        }
      }

      this.vx *= this.friction;
      this.vy *= this.friction;
      this.x += this.vx;
      this.y += this.vy;

      dx = this.targetX - this.x;
      dy = this.targetY - this.y;
      return Math.abs(dx) > 0.22 || Math.abs(dy) > 0.22 || Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1;
    }

    draw() {
      context.fillStyle = `rgba(${inkColor[0]}, ${inkColor[1]}, ${inkColor[2]}, ${this.alpha})`;
      context.fillRect(this.x, this.y, this.size, this.size);
    }
  }

  function draw(update) {
    context.clearRect(0, 0, width, height);
    let moving = false;
    for (const particle of particles) {
      if (update && particle.update()) moving = true;
      particle.draw();
    }
    return moving;
  }

  function animate() {
    frame = 0;
    if (document.hidden || reduceMotion.matches) {
      draw(false);
      return;
    }
    if (draw(true)) frame = requestAnimationFrame(animate);
  }

  function requestAnimation() {
    if (reduceMotion.matches || document.hidden) {
      draw(false);
      return;
    }
    if (!frame) frame = requestAnimationFrame(animate);
  }

  function resize() {
    const rect = button.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    width = rect.width;
    height = rect.height;
    pixelRatio = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = true;

    if (imageReady) createTargets(false);
  }

  function createTargets(scatter) {
    const probe = document.createElement('canvas');
    const scale = Math.min(2, pixelRatio);
    probe.width = Math.max(1, Math.round(width * scale));
    probe.height = Math.max(1, Math.round(height * scale));
    const probeContext = probe.getContext('2d', { willReadFrequently: true });
    if (!probeContext) return;

    const fitScale = Math.min(probe.width / image.naturalWidth, probe.height / image.naturalHeight);
    const drawWidth = image.naturalWidth * fitScale;
    const drawHeight = image.naturalHeight * fitScale;
    probeContext.drawImage(image, (probe.width - drawWidth) / 2, (probe.height - drawHeight) / 2, drawWidth, drawHeight);

    let pixels;
    try {
      pixels = probeContext.getImageData(0, 0, probe.width, probe.height).data;
    } catch (error) {
      console.warn('[Music Home] Could not read signature image for particle rendering.', error);
      return;
    }

    const candidates = [];
    for (let y = 0; y < probe.height; y += 1) {
      for (let x = 0; x < probe.width; x += 1) {
        const index = (y * probe.width + x) * 4;
        const alpha = pixels[index + 3] / 255;
        const luminance = 0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2];
        if (alpha > 0.22 && luminance < 175) {
          candidates.push({
            x: (x + 0.5) / scale,
            y: (y + 0.5) / scale,
            alpha: Math.min(0.98, Math.max(0.5, alpha))
          });
        }
      }
    }

    if (!candidates.length) return;

    const maxParticles = width < 62 ? 220 : 340;
    const selected = candidates.length <= maxParticles ? candidates : [];
    if (candidates.length > maxParticles) {
      for (let index = 0; index < maxParticles; index += 1) selected.push(candidates[Math.floor(index * candidates.length / maxParticles)]);
    }

    particles.length = 0;
    for (const point of selected) {
      const particle = new Particle(point.x, point.y, point.alpha);
      if (scatter && !reduceMotion.matches) {
        particle.x = Math.random() * width;
        particle.y = Math.random() * height;
        particle.vx = (Math.random() - 0.5) * 3.2;
        particle.vy = (Math.random() - 0.5) * 3.2;
      }
      particles.push(particle);
    }

    button.classList.add('is-ready');
    draw(false);
    if (scatter && !reduceMotion.matches) requestAnimation();
  }

  function replay() {
    if (!imageReady) return;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    createTargets(true);
  }

  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    requestAnimation();
  }

  image.onload = () => {
    imageReady = true;
    createTargets(true);
  };
  image.onerror = () => console.warn('[Music Home] Signature image could not be loaded; showing the static fallback.');

  resize();
  image.src = './signature.png?v=1';
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(button);
  else window.addEventListener('resize', resize, { passive: true });

  button.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch' || event.buttons > 0) updatePointer(event);
  }, { passive: true });
  button.addEventListener('pointerdown', updatePointer, { passive: true });
  button.addEventListener('pointerleave', () => {
    pointer = null;
    requestAnimation();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      draw(false);
    } else if (imageReady) {
      requestAnimation();
    }
  });
  reduceMotion.addEventListener?.('change', () => {
    if (reduceMotion.matches && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    draw(false);
  });

  window.HomeMusicSignature = { replay };
})();
