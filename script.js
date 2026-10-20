/**
 * ====================================================================
 * VƯỜN HOA HỒNG 20/10 – MỘT CHÚT DỊU DÀNG GỬI BẠN
 * Website chúc mừng ngày Phụ nữ Việt Nam 20/10 dành tặng bạn bè
 * ====================================================================
 */

// ====================================================================
// 1. CẤU HÌNH TÙY CHỈNH (CUSTOMIZATION CONFIG)
// Bạn có thể chỉnh sửa các giá trị dưới đây hoặc truyền qua URL:
// Ví dụ: index.html?to=Minh+Anh&from=Hoàng
// ====================================================================
const CONFIG = {
  recipientName: "",        // Tên người nhận (để trống sẽ dùng mặc định thân mật)
  senderName: "",           // Tên người gửi (để trống sẽ dùng "Một người bạn gửi chút niềm vui đến bạn ❤️")
  customGreeting: "",       // Lời chúc tùy chỉnh (nếu muốn thay thế toàn bộ lời chúc)
  flowerDensity: 1.0,       // Mật độ hoa (0.5: nhẹ nhàng, 1.0: chuẩn, 1.5: rực rỡ)
  animationSpeed: 1.0,      // Hệ số tốc độ hiệu ứng (1.0 là tối ưu)
  enableMusic: true         // Sẵn sàng hệ thống âm thanh
};

// ====================================================================
// 2. KHỞI TẠO STATE & QUẢN LÝ GIAI ĐOẠN (STATE MACHINE)
// Giai đoạn: 'idle' | 'awakening' | 'blooming' | 'gardenComplete' | 'cardReveal'
// ====================================================================
const APP_STATE = {
  stage: 'idle',
  isDragging: false,
  dragProgress: 0,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  maxDragDist: 100,
  isAudioPlaying: false,
  isSpeaking: false,
  synthAudio: null
};

// DOM Elements Cache
const DOM = {
  app: document.getElementById('app'),
  heroRoseSection: document.getElementById('heroRoseSection'),
  seedRose: document.getElementById('seedRose'),
  ringProgress: document.getElementById('ringProgress'),
  dragHintRing: document.getElementById('dragHintRing'),
  awakeningBarWrapper: document.getElementById('awakeningBarWrapper'),
  awakeningProgressFill: document.getElementById('awakeningProgressFill'),
  awakeningStatusText: document.getElementById('awakeningStatusText'),
  gardenWorld: document.getElementById('gardenWorld'),
  gardenBack: document.getElementById('gardenBack'),
  gardenMid: document.getElementById('gardenMid'),
  gardenFront: document.getElementById('gardenFront'),
  gardenCreatures: document.getElementById('gardenCreatures'),
  gardenBanner: document.getElementById('gardenBanner'),
  cardSection: document.getElementById('cardSection'),
  greetingCard: document.getElementById('greetingCard'),
  cardRecipientDisplay: document.getElementById('cardRecipientDisplay'),
  cardSignatureDisplay: document.getElementById('cardSignatureDisplay'),
  cardMessage: document.getElementById('cardMessage'),
  canvas: document.getElementById('particleCanvas'),
  toast: document.getElementById('toastNotification'),
  toastMessage: document.getElementById('toastMessage'),
  toastIcon: document.getElementById('toastIcon'),
  // Buttons
  btnSpawnFlowers: document.getElementById('btnSpawnFlowers'),
  btnToggleMusic: document.getElementById('btnToggleMusic'),
  btnQuickMusic: document.getElementById('btnQuickMusic'),
  musicIcon: document.getElementById('musicIcon'),
  musicLabel: document.getElementById('musicLabel'),
  quickSoundIcon: document.getElementById('quickSoundIcon'),
  btnSpeak: document.getElementById('btnSpeak'),
  speakIcon: document.getElementById('speakIcon'),
  speakLabel: document.getElementById('speakLabel'),
  btnCopyGreeting: document.getElementById('btnCopyGreeting'),
  btnReplayGarden: document.getElementById('btnReplayGarden'),
  btnShareModal: document.getElementById('btnShareModal'),
  // Modal
  shareModal: document.getElementById('shareModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  inputRecipient: document.getElementById('inputRecipient'),
  inputSender: document.getElementById('inputSender'),
  btnApplyAndCopyLink: document.getElementById('btnApplyAndCopyLink'),
  btnApplyAndPreview: document.getElementById('btnApplyAndPreview'),
  bgAudio: document.getElementById('bgMusic')
};

// ====================================================================
// 3. CANVAS PARTICLE SYSTEM (HOA RƠI, BỤI NẮNG & TIA SÁNG LẤP LÁNH)
// Tối ưu hóa 60fps trên cả thiết bị di động
// ====================================================================
class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.sparks = [];
    this.isMobile = window.innerWidth < 768;
    this.maxParticles = this.isMobile ? 32 : 65;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.animationFrameId = null;
    this.isActive = true;

    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });

    this.initParticles();
    this.loop();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.isMobile = this.width < 768;
    this.maxParticles = this.isMobile ? 32 : 65;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createPetal(true));
    }
  }

  createPetal(randomY = false) {
    const colors = [
      { r: 255, g: 117, b: 140 }, // rose blush
      { r: 255, g: 154, b: 139 }, // coral peach
      { r: 255, g: 182, b: 193 }, // light pink
      { r: 255, g: 220, b: 230 }, // soft cream pink
      { r: 255, g: 245, b: 235 }  // warm petal
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      type: Math.random() > 0.35 ? 'petal' : 'dust',
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -20 - Math.random() * 50,
      size: Math.random() * 9 + 6,
      vx: (Math.random() - 0.5) * 1.2 + 0.3,
      vy: Math.random() * 1.4 + 0.8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2.5,
      flipAngle: Math.random() * 360,
      flipSpeed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.65 + 0.35,
      color: color
    };
  }

  emitSparkle(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1;
      this.sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 2,
        life: 1.0,
        decay: Math.random() * 0.035 + 0.02,
        color: Math.random() > 0.4 ? '#ffd166' : '#ff758c'
      });
    }
  }

  burstFlowerExplosion(x, y, count = 25) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      const petal = this.createPetal();
      petal.x = x;
      petal.y = y;
      petal.vx = Math.cos(angle) * speed;
      petal.vy = Math.sin(angle) * speed - 1.5;
      petal.size = Math.random() * 12 + 8;
      this.particles.push(petal);
    }
    this.emitSparkle(x, y, 15);
  }

  update() {
    // Cập nhật cánh hoa & bụi sáng
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx + Math.sin(p.flipAngle * 0.02) * 0.6;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.flipAngle += p.flipSpeed;

      if (p.y > this.height + 40 || p.x < -40 || p.x > this.width + 40) {
        if (this.particles.length > this.maxParticles) {
          this.particles.splice(i, 1);
        } else {
          this.particles[i] = this.createPetal(false);
        }
      }
    }

    // Cập nhật tia sáng chạm vuốt
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.size *= 0.96;
      s.life -= s.decay;
      if (s.life <= 0 || s.size < 0.3) {
        this.sparks.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Vẽ bụi sáng và cánh hoa
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      const scaleY = Math.cos((p.flipAngle * Math.PI) / 180);
      this.ctx.scale(1, Math.max(0.2, Math.abs(scaleY)));

      if (p.type === 'dust') {
        // Hạt bụi nắng lấp lánh tròn
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 235, 175, ${p.opacity * 0.75})`;
        this.ctx.shadowColor = '#ffd166';
        this.ctx.shadowBlur = 6;
        this.ctx.fill();
      } else {
        // Cánh hoa hồng hình giọt cánh cong mềm mại
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.9, p.size * 0.7, 0, p.size);
        this.ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.7, -p.size * 0.8, -p.size * 0.5, 0, -p.size);
        this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
        this.ctx.shadowColor = 'rgba(255, 117, 140, 0.35)';
        this.ctx.shadowBlur = 4;
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    // Vẽ tia sáng lấp lánh (drag sparks)
    for (const s of this.sparks) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = s.color;
      this.ctx.globalAlpha = Math.max(0, s.life);
      this.ctx.shadowColor = '#fff';
      this.ctx.shadowBlur = 8;
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  loop() {
    if (!this.isActive) return;
    this.update();
    this.draw();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  pause() {
    this.isActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  resume() {
    if (!this.isActive) {
      this.isActive = true;
      this.loop();
    }
  }
}

// ====================================================================
// 4. PROCEDURAL WEB AUDIO SYNTHESIZER (NHẠC KHÔNG LỜI DU DƯƠNG 100% OFFLINE)
// Tự tạo giai điệu êm dịu, trong trẻo như hộp nhạc / đàn celesta
// ====================================================================
class GardenAudioSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.step = 0;
    
    // Giai điệu nhẹ nhàng dựa trên thang âm ngũ cung/diatonic ngọt ngào (C major / A minor)
    // Tần số nốt nhạc (Hz)
    this.notes = {
      C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
      C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
      B4: 493.88, F4: 349.23
    };

    // Chuỗi hợp âm và arpeggio du dương
    this.melodySequence = [
      ['C4', 'E4', 'G4', 'C5'],
      ['A4', 'C5', 'E5'],
      ['F4', 'A4', 'C5'],
      ['G4', 'B4', 'D5'],
      ['E4', 'G4', 'B4', 'E5'],
      ['A4', 'C5', 'E5'],
      ['F4', 'A4', 'D5'],
      ['G4', 'C5', 'E5', 'G5']
    ];
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, time, duration = 1.6, gainLevel = 0.12) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Sóng sin kết hợp sóng tam giác tạo âm thanh mềm mại như tiếng đàn harp / chuông gió
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(gainLevel, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  start() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.step = 0;

    const playNextBar = () => {
      if (!this.isPlaying || !this.ctx) return;
      const currentBar = this.melodySequence[this.step % this.melodySequence.length];
      const now = this.ctx.currentTime;

      currentBar.forEach((noteName, idx) => {
        const noteFreq = this.notes[noteName];
        if (noteFreq) {
          this.playTone(noteFreq, now + idx * 0.35, 1.8, 0.1);
        }
      });

      this.step++;
      this.timer = setTimeout(playNextBar, currentBar.length * 360 + 200);
    };

    playNextBar();
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }
}

// ====================================================================
// 5. TẠO KHU VƯỜN HOA HỒNG TỰ NHIÊN (GARDEN WORLD GENERATION)
// Sinh các cụm hoa đa dạng kích thước, màu sắc và độ sâu không gian
// ====================================================================
function createGardenCluster() {
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? Math.floor(18 * CONFIG.flowerDensity) : Math.floor(34 * CONFIG.flowerDensity);
  
  // Xóa hoa cũ nếu có
  DOM.gardenBack.innerHTML = '';
  DOM.gardenMid.innerHTML = '';
  DOM.gardenFront.innerHTML = '';
  DOM.gardenCreatures.innerHTML = '';

  const colorPalettes = ['#ff758c', '#ff9a8b', '#ffd1dc', '#ff4b72', '#ffebee'];
  const gradientIds = ['url(#roseGradPink)', 'url(#roseGradPeach)', 'url(#roseGradCream)'];

  // Tạo hoa theo 3 lớp không gian (Back, Mid, Front)
  for (let i = 0; i < count; i++) {
    const node = document.createElement('div');
    node.className = 'garden-flower-node';
    
    // Tỉ lệ vị trí phủ kín viền trái, phải và đáy màn hình, nhường trung tâm cho thiệp
    let posX, posY;
    const isLeftSide = Math.random() < 0.48;
    
    if (isLeftSide) {
      posX = Math.random() * 38; // 0% -> 38%
    } else {
      posX = 62 + Math.random() * 38; // 62% -> 100%
    }
    // Một số hoa ở đáy màn hình
    if (Math.random() < 0.28) {
      posX = Math.random() * 100;
      posY = 72 + Math.random() * 26; // 72% -> 98%
    } else {
      posY = 10 + Math.random() * 85;
    }

    // Chọn lớp không gian
    let targetLayer = DOM.gardenMid;
    let size = 55 + Math.random() * 45;
    let animDelay = (Math.random() * 1.5).toFixed(2);
    let swayDuration = (3.5 + Math.random() * 3).toFixed(2);

    if (posY < 40 || Math.random() < 0.3) {
      targetLayer = DOM.gardenBack;
      size *= 0.72;
    } else if (posY > 65 && Math.random() < 0.35) {
      targetLayer = DOM.gardenFront;
      size *= 1.25;
    }

    node.style.left = `${posX}%`;
    node.style.top = `${posY}%`;
    node.style.width = `${size}px`;
    node.style.height = `${size}px`;
    node.style.animation = `flowerBlossom 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${animDelay}s forwards, plantSway ${swayDuration}s ease-in-out infinite alternate`;

    // Chọn biểu tượng hoa nở hoặc nụ hoa
    const isBud = Math.random() < 0.25;
    const grad = gradientIds[Math.floor(Math.random() * gradientIds.length)];

    node.innerHTML = `
      <svg viewBox="-60 -60 120 120">
        <g style="color: ${grad}">
          <use href="${isBud ? '#roseBudGraphic' : '#roseBloomGraphic'}"/>
        </g>
      </svg>
    `;

    targetLayer.appendChild(node);
  }

  // Thêm 3 chú bướm nhỏ bay lượn nhẹ nhàng trong vườn
  createButterflies();
}

function createButterflies() {
  const butterflyCount = 3;
  for (let i = 0; i < butterflyCount; i++) {
    const butterfly = document.createElement('div');
    butterfly.className = 'garden-butterfly';
    butterfly.innerHTML = `
      <svg viewBox="-40 -30 80 60">
        <use href="#butterflyGraphic"/>
      </svg>
    `;

    const startX = 20 + Math.random() * 60;
    const startY = 30 + Math.random() * 40;
    butterfly.style.left = `${startX}%`;
    butterfly.style.top = `${startY}%`;

    DOM.gardenCreatures.appendChild(butterfly);
    animateButterfly(butterfly, startX, startY);
  }
}

function animateButterfly(el, currentX, currentY) {
  if (APP_STATE.stage === 'idle') return;

  const targetX = Math.max(10, Math.min(90, currentX + (Math.random() - 0.5) * 35));
  const targetY = Math.max(15, Math.min(85, currentY + (Math.random() - 0.5) * 30));
  const duration = 4000 + Math.random() * 3500;

  const dx = targetX - currentX;
  const rotation = dx > 0 ? 15 : -15;

  el.animate([
    { transform: `translate(0, 0) rotate(${rotation}deg)` },
    { transform: `translate(${(targetX - currentX) * 4}px, ${(targetY - currentY) * 3}px) rotate(${-rotation}deg)` }
  ], {
    duration: duration,
    easing: 'ease-in-out'
  }).onfinish = () => {
    el.style.left = `${targetX}%`;
    el.style.top = `${targetY}%`;
    animateButterfly(el, targetX, targetY);
  };
}

// ====================================================================
// 6. TƯƠNG TÁC KÉO HOA (POINTER EVENTS - MOUSE & TOUCH)
// Hỗ trợ mượt mà trên cả máy tính lẫn cảm ứng điện thoại
// ====================================================================
function initDragInteraction(particleEngine) {
  const seed = DOM.seedRose;

  const onPointerDown = (e) => {
    if (APP_STATE.stage !== 'idle' && APP_STATE.stage !== 'awakening') return;

    APP_STATE.isDragging = true;
    APP_STATE.startX = e.clientX;
    APP_STATE.startY = e.clientY;
    APP_STATE.currentX = e.clientX;
    APP_STATE.currentY = e.clientY;

    seed.classList.add('dragging');
    seed.setPointerCapture(e.pointerId);

    DOM.awakeningBarWrapper.classList.add('visible');
    DOM.dragHintRing.style.opacity = '1';

    // Tạo tia sáng ngay tại điểm chạm
    particleEngine.emitSparkle(e.clientX, e.clientY, 8);
  };

  const onPointerMove = (e) => {
    if (!APP_STATE.isDragging) return;

    APP_STATE.currentX = e.clientX;
    APP_STATE.currentY = e.clientY;

    const dx = APP_STATE.currentX - APP_STATE.startX;
    const dy = APP_STATE.currentY - APP_STATE.startY;
    const dist = Math.hypot(dx, dy);

    // Tính tiến trình 0 -> 1
    APP_STATE.dragProgress = Math.min(1, dist / APP_STATE.maxDragDist);

    // Cập nhật dịch chuyển bông hoa với độ đàn hồi
    const damp = 0.65;
    seed.style.transform = `translate(${dx * damp}px, ${dy * damp}px) scale(${1 + APP_STATE.dragProgress * 0.18}) rotate(${dx * 0.08}deg)`;

    // Cập nhật vòng tròn tiến trình
    const circleCircumference = 534; // 2 * PI * 85
    const offset = circleCircumference - (APP_STATE.dragProgress * circleCircumference);
    DOM.ringProgress.style.strokeDashoffset = offset;

    // Cập nhật thanh tiến trình
    const percent = Math.round(APP_STATE.dragProgress * 100);
    DOM.awakeningProgressFill.style.width = `${percent}%`;

    if (APP_STATE.dragProgress > 0.6) {
      DOM.awakeningStatusText.textContent = "Khu vườn sắp thức giấc rồi! 🌸";
    } else if (APP_STATE.dragProgress > 0.25) {
      DOM.awakeningStatusText.textContent = "Những mầm hoa đang nở dần... 🌿";
    }

    // Tung tia sáng theo đường di chuyển
    if (Math.random() < 0.45) {
      particleEngine.emitSparkle(e.clientX, e.clientY, 3);
    }

    // Nếu kéo đạt mốc 90% thì kích hoạt nở hoàn toàn
    if (APP_STATE.dragProgress >= 0.9) {
      triggerFullBloomSequence(particleEngine);
      try {
        seed.releasePointerCapture(e.pointerId);
      } catch (err) {}
      APP_STATE.isDragging = false;
    }
  };

  const onPointerUp = (e) => {
    if (!APP_STATE.isDragging) return;
    APP_STATE.isDragging = false;
    seed.classList.remove('dragging');

    try {
      seed.releasePointerCapture(e.pointerId);
    } catch (err) {}

    // Nếu kéo được quá 38% thì tự động hoàn thành nở hoa
    if (APP_STATE.dragProgress >= 0.38) {
      triggerFullBloomSequence(particleEngine);
    } else {
      // Nếu thả quá sớm thì khôi phục lại vị trí ban đầu
      seed.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      seed.style.transform = '';
      DOM.ringProgress.style.strokeDashoffset = 534;
      DOM.awakeningProgressFill.style.width = '0%';
      DOM.awakeningBarWrapper.classList.remove('visible');

      setTimeout(() => {
        seed.style.transition = '';
      }, 500);

      showToast("Kéo xa hơn một chút để đánh thức khu vườn nhé! 🌷", "✨");
    }
  };

  seed.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  // Hỗ trợ phím Enter / Space cho thiết bị accessibility
  seed.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFullBloomSequence(particleEngine);
    }
  });
}

// ====================================================================
// 7. CHUỖI HIỆU ỨNG NỞ HOA & MỞ THIỆP (STAGE TRANSITIONS)
// ====================================================================
function triggerFullBloomSequence(particleEngine) {
  if (APP_STATE.stage !== 'idle' && APP_STATE.stage !== 'awakening') return;

  APP_STATE.stage = 'blooming';
  DOM.app.className = 'app-container stage-blooming';

  // Hiệu ứng pháo hoa cánh hoa tại vị trí bông hoa trung tâm
  const rect = DOM.seedRose.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  particleEngine.burstFlowerExplosion(centerX, centerY, 35);

  // Sinh các cụm hoa của khu vườn
  DOM.gardenWorld.classList.add('active');
  createGardenCluster();

  // Khởi động nhạc nhẹ nhàng nếu người dùng cho phép
  if (CONFIG.enableMusic && !APP_STATE.isAudioPlaying) {
    toggleMusic(true);
  }

  // Sau 1.2s: Khu vườn rực rỡ và biểu ngữ xuất hiện
  setTimeout(() => {
    APP_STATE.stage = 'gardenComplete';
    DOM.app.className = 'app-container stage-gardenComplete';
    DOM.gardenBanner.classList.add('visible');

    // Sau 3.5s: Biểu ngữ mờ dần và mở tấm thiệp chúc mừng
    setTimeout(() => {
      DOM.gardenBanner.classList.remove('visible');
      DOM.gardenBanner.classList.add('fade-out');

      setTimeout(() => {
        revealGreetingCard(particleEngine);
      }, 700);

    }, 3200);

  }, 1200);
}

function revealGreetingCard(particleEngine) {
  APP_STATE.stage = 'cardReveal';
  DOM.app.className = 'app-container stage-cardReveal';

  DOM.cardSection.hidden = false;
  DOM.cardSection.style.display = 'flex';

  // Hiệu ứng lấp lánh nhẹ quanh thiệp
  const cardRect = DOM.greetingCard.getBoundingClientRect();
  particleEngine.burstFlowerExplosion(cardRect.left + cardRect.width / 2, cardRect.top + 80, 20);

  // Cuộn nhẹ thiệp lên đầu
  DOM.greetingCard.querySelector('.card-body').scrollTop = 0;
}

// ====================================================================
// 8. TÍNH NĂNG ÂM THANH & WEB SPEECH API (ĐỌC LỜI CHÚC)
// ====================================================================
function toggleMusic(forcePlay = null) {
  const synth = APP_STATE.synthAudio;
  const audioEl = DOM.bgAudio;

  let shouldPlay = forcePlay !== null ? forcePlay : !APP_STATE.isAudioPlaying;

  if (shouldPlay) {
    // Thử chạy audio element nếu có file mp3, nếu không dùng Procedural Web Audio Synth
    if (audioEl && audioEl.src && !audioEl.error) {
      audioEl.play().catch(() => {
        synth.start();
      });
    } else {
      synth.start();
    }
    APP_STATE.isAudioPlaying = true;
    DOM.btnQuickMusic.classList.add('playing');
    DOM.musicLabel.textContent = "Tắt nhạc";
    DOM.quickSoundIcon.textContent = "🔊";
    showToast("Đang phát nhạc nền nhẹ nhàng 🎶", "🎵");
  } else {
    synth.stop();
    if (audioEl) audioEl.pause();
    APP_STATE.isAudioPlaying = false;
    DOM.btnQuickMusic.classList.remove('playing');
    DOM.musicLabel.textContent = "Nhạc nền";
    DOM.quickSoundIcon.textContent = "🎵";
    showToast("Đã tạm dừng nhạc nền", "🔇");
  }
}

function speakGreeting() {
  if (!('speechSynthesis' in window)) {
    showToast("Trình duyệt không hỗ trợ Web Speech API", "⚠️");
    return;
  }

  if (APP_STATE.isSpeaking) {
    window.speechSynthesis.cancel();
    APP_STATE.isSpeaking = false;
    DOM.speakLabel.textContent = "Đọc lời chúc";
    DOM.speakIcon.textContent = "🔊";
    showToast("Đã dừng đọc lời chúc", "⏹️");
    return;
  }

  window.speechSynthesis.cancel(); // Dọn dẹp câu cũ

  // Lấy nội dung lời chúc từ thiệp
  const recipient = DOM.cardRecipientDisplay.textContent;
  const paragraphs = Array.from(DOM.cardMessage.querySelectorAll('.msg-para'))
    .map(p => p.textContent)
    .join('. ');
  const signature = DOM.cardSignatureDisplay.textContent;
  const fullSpeechText = `Chúc mừng ngày hai mươi tháng mười. ${recipient}. ${paragraphs}. ${signature}`;

  const utterance = new SpeechSynthesisUtterance(fullSpeechText);
  utterance.lang = 'vi-VN';
  utterance.rate = 0.95; // Tốc độ ấm áp, truyền cảm
  utterance.pitch = 1.05;

  // Tìm giọng tiếng Việt nếu có
  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VN'));
  if (viVoice) {
    utterance.voice = viVoice;
  }

  utterance.onstart = () => {
    APP_STATE.isSpeaking = true;
    DOM.speakLabel.textContent = "Dừng đọc";
    DOM.speakIcon.textContent = "⏹️";
    showToast("Đang đọc lời chúc mừng 20/10... 🎙️", "🌸");
  };

  utterance.onend = () => {
    APP_STATE.isSpeaking = false;
    DOM.speakLabel.textContent = "Đọc lời chúc";
    DOM.speakIcon.textContent = "🔊";
  };

  utterance.onerror = () => {
    APP_STATE.isSpeaking = false;
    DOM.speakLabel.textContent = "Đọc lời chúc";
    DOM.speakIcon.textContent = "🔊";
  };

  window.speechSynthesis.speak(utterance);
}

// ====================================================================
// 9. CÁC NÚT TƯƠNG TÁC BỔ SUNG & TIỆN ÍCH
// ====================================================================
function copyGreetingText() {
  const recipient = DOM.cardRecipientDisplay.textContent;
  const paragraphs = Array.from(DOM.cardMessage.querySelectorAll('.msg-para'))
    .map(p => p.textContent)
    .join('\n\n');
  const signature = DOM.cardSignatureDisplay.textContent;

  const fullText = `🌸 CHÚC MỪNG NGÀY 20/10 🌸\n\n${recipient}\n\n${paragraphs}\n\nHappy Vietnamese Women's Day!\n${signature}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullText)
      .then(() => showToast("Đã sao chép lời chúc 20/10 vào khay nhớ tạm! 💖", "📋"))
      .catch(() => fallbackCopy(fullText));
  } else {
    fallbackCopy(fullText);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast("Đã sao chép lời chúc 20/10 vào khay nhớ tạm! 💖", "📋");
  } catch (err) {
    showToast("Không thể sao chép tự động", "⚠️");
  }
  document.body.removeChild(textarea);
}

function replayGarden(particleEngine) {
  // Dừng đọc nếu đang đọc
  if (APP_STATE.isSpeaking && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    APP_STATE.isSpeaking = false;
    DOM.speakLabel.textContent = "Đọc lời chúc";
  }

  // Đặt lại state
  APP_STATE.stage = 'idle';
  APP_STATE.isDragging = false;
  APP_STATE.dragProgress = 0;

  DOM.app.className = 'app-container stage-idle';
  DOM.cardSection.hidden = true;
  DOM.cardSection.style.display = 'none';
  DOM.gardenWorld.classList.remove('active');
  DOM.gardenBanner.classList.remove('visible', 'fade-out');

  // Đặt lại vị trí bông hoa hero
  DOM.seedRose.style.transform = '';
  DOM.ringProgress.style.strokeDashoffset = 534;
  DOM.awakeningProgressFill.style.width = '0%';
  DOM.awakeningBarWrapper.classList.remove('visible');
  DOM.awakeningStatusText.textContent = "Đang đánh thức mầm hoa... 🌿";

  // Tạo đợt hoa rơi nhẹ
  particleEngine.initParticles();
  showToast("Hãy kéo lại bông hoa để trải nghiệm nhé! 🌹", "✨");
}

function showToast(message, icon = "🌸") {
  DOM.toastIcon.textContent = icon;
  DOM.toastMessage.textContent = message;
  DOM.toast.classList.add('show');

  if (showToast.timer) clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    DOM.toast.classList.remove('show');
  }, 3200);
}

// ====================================================================
// 10. TÙY CHỈNH THÔNG TIN QUA URL & MODAL CHIA SẺ
// ====================================================================
function applyPersonalizationFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const toParam = params.get('to') || params.get('name') || CONFIG.recipientName;
  const fromParam = params.get('from') || params.get('sender') || CONFIG.senderName;
  const msgParam = params.get('msg') || CONFIG.customGreeting;

  if (toParam && toParam.trim() !== '') {
    CONFIG.recipientName = toParam.trim();
    DOM.cardRecipientDisplay.textContent = `Gửi ${CONFIG.recipientName} thân mến 🌷`;
    DOM.inputRecipient.value = CONFIG.recipientName;
  }

  if (fromParam && fromParam.trim() !== '') {
    CONFIG.senderName = fromParam.trim();
    DOM.cardSignatureDisplay.textContent = `— ${CONFIG.senderName} ❤️`;
    DOM.inputSender.value = CONFIG.senderName;
  }

  if (msgParam && msgParam.trim() !== '') {
    DOM.cardMessage.innerHTML = `<p class="msg-para">${msgParam.trim().replace(/\n/g, '<br>')}</p>`;
  }
}

function initShareModal() {
  DOM.btnShareModal.addEventListener('click', () => {
    DOM.shareModal.hidden = false;
  });

  DOM.btnCloseModal.addEventListener('click', () => {
    DOM.shareModal.hidden = true;
  });

  DOM.shareModal.addEventListener('click', (e) => {
    if (e.target === DOM.shareModal) {
      DOM.shareModal.hidden = true;
    }
  });

  DOM.btnApplyAndPreview.addEventListener('click', () => {
    const to = DOM.inputRecipient.value.trim();
    const from = DOM.inputSender.value.trim();
    if (to) {
      DOM.cardRecipientDisplay.textContent = `Gửi ${to} thân mến 🌷`;
    }
    if (from) {
      DOM.cardSignatureDisplay.textContent = `— ${from} ❤️`;
    }
    DOM.shareModal.hidden = true;
    showToast("Đã cập nhật thiệp chúc mừng! 💌", "✨");
  });

  DOM.btnApplyAndCopyLink.addEventListener('click', () => {
    const to = encodeURIComponent(DOM.inputRecipient.value.trim());
    const from = encodeURIComponent(DOM.inputSender.value.trim());
    
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?to=${to}&from=${from}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("Đã sao chép link quà tặng mang tên bạn! 🔗", "💌");
      });
    } else {
      fallbackCopy(shareUrl);
    }
    DOM.shareModal.hidden = true;
  });
}

// ====================================================================
// 11. KHỞI CHẠY ỨNG DỤNG (ENTRY POINT)
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Áp dụng tùy chỉnh từ URL (nếu có)
  applyPersonalizationFromUrl();

  // 2. Khởi tạo Particle Engine
  const particleEngine = new ParticleEngine(DOM.canvas);

  // 3. Khởi tạo Audio Synthesizer
  APP_STATE.synthAudio = new GardenAudioSynth();

  // 4. Kích hoạt tương tác kéo thả bông hoa hero
  initDragInteraction(particleEngine);

  // 5. Gán sự kiện cho các nút chức năng
  DOM.btnSpawnFlowers.addEventListener('click', (e) => {
    const rect = e.target.getBoundingClientRect();
    particleEngine.burstFlowerExplosion(rect.left + rect.width / 2, rect.top, 25);
    showToast("Những bông hoa hồng đang bay phấp phới! 🌹", "✨");
  });

  DOM.btnToggleMusic.addEventListener('click', () => toggleMusic());
  DOM.btnQuickMusic.addEventListener('click', () => toggleMusic());
  DOM.btnSpeak.addEventListener('click', speakGreeting);
  DOM.btnCopyGreeting.addEventListener('click', copyGreetingText);
  DOM.btnReplayGarden.addEventListener('click', () => replayGarden(particleEngine));

  // 6. Modal chia sẻ
  initShareModal();
});
