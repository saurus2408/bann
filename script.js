/**
 * ====================================================================
 * VƯỜN HOA HỒNG 20/10 – MỘT CHÚT DỊU DÀNG GỬI BẠN
 * Website chúc mừng ngày Phụ nữ Việt Nam 20/10 dành tặng bạn bè
 * Hiển thị trực tiếp hoa hồng và thiệp chúc mừng rực rỡ (Không cần nhập tên)
 * ====================================================================
 */

// ====================================================================
// 1. CẤU HÌNH TÙY CHỈNH (CUSTOMIZATION CONFIG)
// ====================================================================
const CONFIG = {
  recipientName: "",        // Tên người nhận (để trống sẽ dùng mặc định "bạn thân mến")
  senderName: "",           // Tên người gửi (để trống sẽ dùng "Một người bạn gửi chút niềm vui đến bạn ❤️")
  customGreeting: "",       // Lời chúc tùy chỉnh nếu muốn truyền qua URL
  flowerDensity: 1.0,       // Mật độ hoa (0.5: nhẹ nhàng, 1.0: chuẩn, 1.5: rực rỡ)
  enableMusic: true         // Sẵn sàng hệ thống âm thanh
};

// ====================================================================
// 2. KHỞI TẠO STATE & DOM ELEMENTS CACHE
// ====================================================================
const APP_STATE = {
  isAudioPlaying: false,
  isSpeaking: false,
  synthAudio: null,
  userInteracted: false
};

// DOM Elements Cache
const DOM = {
  app: document.getElementById('app'),
  gardenWorld: document.getElementById('gardenWorld'),
  gardenBack: document.getElementById('gardenBack'),
  gardenMid: document.getElementById('gardenMid'),
  gardenFront: document.getElementById('gardenFront'),
  gardenCreatures: document.getElementById('gardenCreatures'),
  cardSection: document.getElementById('cardSection'),
  greetingCard: document.getElementById('greetingCard'),
  cardHeroRose: document.getElementById('cardHeroRose'),
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
  btnRebloom: document.getElementById('btnRebloom'),
  btnShareLink: document.getElementById('btnShareLink'),
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

  emitSparkle(x, y, count = 6) {
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

  burstFlowerExplosion(x, y, count = 28) {
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
    this.emitSparkle(x, y, 16);
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

    // Cập nhật tia sáng
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
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 235, 175, ${p.opacity * 0.75})`;
        this.ctx.shadowColor = '#ffd166';
        this.ctx.shadowBlur = 6;
        this.ctx.fill();
      } else {
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

    // Vẽ tia sáng lấp lánh
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
// Giai điệu trong trẻo, êm ái như tiếng đàn celesta / hộp nhạc
// ====================================================================
class GardenAudioSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.step = 0;
    
    this.notes = {
      C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
      C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
      B4: 493.88, F4: 349.23
    };

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
// ====================================================================
function createGardenCluster() {
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? Math.floor(18 * CONFIG.flowerDensity) : Math.floor(34 * CONFIG.flowerDensity);
  
  DOM.gardenBack.innerHTML = '';
  DOM.gardenMid.innerHTML = '';
  DOM.gardenFront.innerHTML = '';
  DOM.gardenCreatures.innerHTML = '';

  const gradientIds = ['url(#roseGradPink)', 'url(#roseGradPeach)', 'url(#roseGradCream)'];

  for (let i = 0; i < count; i++) {
    const node = document.createElement('div');
    node.className = 'garden-flower-node';
    
    let posX, posY;
    const isLeftSide = Math.random() < 0.48;
    
    if (isLeftSide) {
      posX = Math.random() * 36; // Viền bên trái
    } else {
      posX = 64 + Math.random() * 36; // Viền bên phải
    }

    if (Math.random() < 0.28) {
      posX = Math.random() * 100;
      posY = 74 + Math.random() * 24; // Đáy màn hình
    } else {
      posY = 8 + Math.random() * 86;
    }

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

    const startX = 15 + Math.random() * 70;
    const startY = 20 + Math.random() * 60;
    butterfly.style.left = `${startX}%`;
    butterfly.style.top = `${startY}%`;

    DOM.gardenCreatures.appendChild(butterfly);
    animateButterfly(butterfly, startX, startY);
  }
}

function animateButterfly(el, currentX, currentY) {
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
// 6. TÍNH NĂNG ÂM THANH & WEB SPEECH API (ĐỌC LỜI CHÚC)
// ====================================================================
function toggleMusic(forcePlay = null) {
  const synth = APP_STATE.synthAudio;
  const audioEl = DOM.bgAudio;

  let shouldPlay = forcePlay !== null ? forcePlay : !APP_STATE.isAudioPlaying;

  if (shouldPlay) {
    if (audioEl && audioEl.src && !audioEl.error) {
      audioEl.play().catch(() => {
        if (synth) synth.start();
      });
    } else {
      if (synth) synth.start();
    }
    APP_STATE.isAudioPlaying = true;
    DOM.btnQuickMusic.classList.add('playing');
    DOM.musicLabel.textContent = "Tắt nhạc";
    DOM.quickSoundIcon.textContent = "🔊";
    showToast("Đang phát nhạc nền nhẹ nhàng 🎶", "🎵");
  } else {
    if (synth) synth.stop();
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
    showToast("Trình duyệt không hỗ trợ đọc giọng nói", "⚠️");
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

  window.speechSynthesis.cancel();

  const recipient = DOM.cardRecipientDisplay.textContent;
  const paragraphs = Array.from(DOM.cardMessage.querySelectorAll('.msg-para'))
    .map(p => p.textContent)
    .join('. ');
  const signature = DOM.cardSignatureDisplay.textContent;
  const fullSpeechText = `Chúc mừng ngày hai mươi tháng mười. ${recipient}. ${paragraphs}. ${signature}`;

  const utterance = new SpeechSynthesisUtterance(fullSpeechText);
  utterance.lang = 'vi-VN';
  utterance.rate = 0.95;
  utterance.pitch = 1.05;

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
// 7. CÁC NÚT TƯƠNG TÁC & SAO CHÉP / CHIA SẺ LINK TRỰC TIẾP
// Không yêu cầu nhập tên! Gửi link ngay tức thì.
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
      .catch(() => fallbackCopy(fullText, "Đã sao chép lời chúc 20/10 vào khay nhớ tạm! 💖"));
  } else {
    fallbackCopy(fullText, "Đã sao chép lời chúc 20/10 vào khay nhớ tạm! 💖");
  }
}

function shareWebsiteLink() {
  // Lấy đường dẫn chia sẻ (không kèm các tham số thừa)
  const shareUrl = window.location.origin + window.location.pathname;

  if (navigator.share) {
    navigator.share({
      title: "🌸 Chúc Mừng 20/10 – Vườn Hoa Hồng & Thiệp Dành Tặng Bạn",
      text: "Gửi bạn một vườn hoa hồng và thiệp chúc mừng 20/10 ngập tràn niềm vui nhé! 🌷",
      url: shareUrl
    }).catch(() => {
      // Nếu hủy chia sẻ native thì sao chép link
      copyLinkToClipboard(shareUrl);
    });
  } else {
    copyLinkToClipboard(shareUrl);
  }
}

function copyLinkToClipboard(url) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => showToast("Đã sao chép link quà tặng 20/10! Hãy gửi cho bạn bè nhé 💌✨", "🔗"))
      .catch(() => fallbackCopy(url, "Đã sao chép link quà tặng 20/10! Hãy gửi cho bạn bè nhé 💌✨"));
  } else {
    fallbackCopy(url, "Đã sao chép link quà tặng 20/10! Hãy gửi cho bạn bè nhé 💌✨");
  }
}

function fallbackCopy(text, successMsg = "Đã sao chép!") {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg, "📋");
  } catch (err) {
    showToast("Không thể sao chép tự động", "⚠️");
  }
  document.body.removeChild(textarea);
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
// 8. TÙY CHỈNH THÔNG TIN QUA URL (NẾU CÓ THAM SỐ)
// ====================================================================
function applyPersonalizationFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const toParam = params.get('to') || params.get('name') || CONFIG.recipientName;
  const fromParam = params.get('from') || params.get('sender') || CONFIG.senderName;
  const msgParam = params.get('msg') || CONFIG.customGreeting;

  if (toParam && toParam.trim() !== '') {
    CONFIG.recipientName = toParam.trim();
    DOM.cardRecipientDisplay.textContent = `Gửi ${CONFIG.recipientName} thân mến 🌷`;
  } else {
    DOM.cardRecipientDisplay.textContent = `Gửi bạn thân mến 🌷`;
  }

  if (fromParam && fromParam.trim() !== '') {
    CONFIG.senderName = fromParam.trim();
    DOM.cardSignatureDisplay.textContent = `— ${CONFIG.senderName} ❤️`;
  } else {
    DOM.cardSignatureDisplay.textContent = `— Một người bạn gửi chút niềm vui đến bạn ❤️`;
  }

  if (msgParam && msgParam.trim() !== '') {
    DOM.cardMessage.innerHTML = `<p class="msg-para">${msgParam.trim().replace(/\n/g, '<br>')}</p>`;
  }
}

// ====================================================================
// 9. KHỞI CHẠY ỨNG DỤNG (ENTRY POINT)
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Áp dụng lời chúc (tùy chỉnh nếu có trong URL, hoặc mặc định ấm áp)
  applyPersonalizationFromUrl();

  // 2. Khởi tạo Particle Engine (Cánh hoa rơi & bụi nắng)
  const particleEngine = new ParticleEngine(DOM.canvas);

  // 3. Khởi tạo Audio Synthesizer (Nhạc hộp nhạc du dương)
  APP_STATE.synthAudio = new GardenAudioSynth();

  // 4. Sinh khu vườn hoa hồng nở rộ ngay từ đầu
  createGardenCluster();

  // 5. Tương tác chạm vào bông hoa hồng vương miện trên thiệp
  if (DOM.cardHeroRose) {
    const triggerRoseBlossom = (e) => {
      const rect = DOM.cardHeroRose.getBoundingClientRect();
      const clickX = e && e.clientX ? e.clientX : rect.left + rect.width / 2;
      const clickY = e && e.clientY ? e.clientY : rect.top + rect.height / 2;
      particleEngine.burstFlowerExplosion(clickX, clickY, 32);
      showToast("Bông hoa hồng nở rộ những điều ước tốt đẹp! 🌹✨", "🌸");

      // Tự động bật nhạc nhẹ ở lần chạm đầu tiên nếu chưa bật
      if (CONFIG.enableMusic && !APP_STATE.isAudioPlaying && !APP_STATE.userInteracted) {
        APP_STATE.userInteracted = true;
        toggleMusic(true);
      }
    };

    DOM.cardHeroRose.addEventListener('click', triggerRoseBlossom);
    DOM.cardHeroRose.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerRoseBlossom(e);
      }
    });
  }

  // 6. Gán sự kiện cho các nút hành động
  // 6.1 Tung thêm cánh hoa
  DOM.btnSpawnFlowers.addEventListener('click', (e) => {
    const rect = e.target.getBoundingClientRect();
    particleEngine.burstFlowerExplosion(rect.left + rect.width / 2, rect.top, 28);
    showToast("Những cánh hoa hồng đang bay phấp phới! 🌹", "✨");
  });

  // 6.2 Bật / Tắt nhạc nền
  DOM.btnToggleMusic.addEventListener('click', () => toggleMusic());
  DOM.btnQuickMusic.addEventListener('click', () => toggleMusic());

  // 6.3 Đọc lời chúc bằng giọng nói
  DOM.btnSpeak.addEventListener('click', speakGreeting);

  // 6.4 Sao chép nội dung lời chúc
  DOM.btnCopyGreeting.addEventListener('click', copyGreetingText);

  // 6.5 Nở rộ hoa khu vườn
  DOM.btnRebloom.addEventListener('click', (e) => {
    const rect = e.target.getBoundingClientRect();
    particleEngine.burstFlowerExplosion(rect.left + rect.width / 2, rect.top, 35);
    createGardenCluster();
    showToast("Khu vườn hoa hồng đang bừng nở rực rỡ! 🌸✨", "🌺");
  });

  // 6.6 Gửi bạn bè (Sao chép link trực tiếp, không bắt nhập tên)
  DOM.btnShareLink.addEventListener('click', shareWebsiteLink);
});
