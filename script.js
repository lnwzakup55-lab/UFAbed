let model = null;
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const preview = document.getElementById("preview");
const placeholder = document.getElementById("placeholder");
const loadingEl = document.getElementById("loading");
const predictionsEl = document.getElementById("predictions");
const resultLabel = document.getElementById("resultLabel");

const SPORT_KEYS = [
  { key: "golf", keywords: ["golf", "golf ball", "golf club"] },
  { key: "basketball", keywords: ["basketball", "basketball player"] },
  { key: "f1", keywords: ["race car", "racing car", "formula", "f1", "sports car"] },
  { key: "swimming", keywords: ["swimming", "swimmer", "pool"] },
  { key: "volleyball", keywords: ["volleyball", "volleyball player"] },
  { key: "tennis", keywords: ["tennis", "tennis ball", "racquet", "racket"] }
];

async function initModel() {
  loadingEl.textContent = "🚀 กำลังโหลดโมเดล...";
  try {
    model = await mobilenet.load();
    loadingEl.textContent = "✅ พร้อมใช้งานแล้ว!";
  } catch (err) {
    console.error(err);
    loadingEl.textContent = "❌ โหลดโมเดลไม่สำเร็จ";
  }
}

function mapPredictionToSport(className) {
  const lower = className.toLowerCase();
  for (const s of SPORT_KEYS) {
    if (s.keywords.some(k => lower.includes(k))) return s.key;
  }
  return null;
}

function showImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.style.display = "block";
    placeholder.style.opacity = "0";
    classifyImage();
  };
  reader.readAsDataURL(file);
}

async function classifyImage() {
  if (!model || !preview.src) return;
  loadingEl.textContent = "🔍 กำลังวิเคราะห์...";
  await new Promise(res => (preview.complete ? res() : (preview.onload = res)));

  try {
    const preds = await model.classify(preview, 5);
    displayPredictions(preds);
    const mapped = preds.map(p => mapPredictionToSport(p.className)).find(Boolean);
    resultLabel.textContent = mapped
      ? `🏆 กีฬา: ${mapped.toUpperCase()}`
      : "❔ ไม่สามารถระบุประเภทกีฬาได้";
    loadingEl.textContent = "✅ วิเคราะห์สำเร็จ!";
  } catch (err) {
    console.error(err);
    loadingEl.textContent = "❌ เกิดข้อผิดพลาด";
  }
}

function displayPredictions(preds) {
  predictionsEl.innerHTML = preds.map(p => `
    <div class="pred-item">
      ${p.className} — ${(p.probability * 100).toFixed(1)}%
      <div class="progress">
        <div class="progress-bar" style="width:${p.probability * 100}%"></div>
      </div>
    </div>
  `).join("");
}

uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", e => {
  if (e.target.files && e.target.files[0]) showImage(e.target.files[0]);
});

["dragenter", "dragover"].forEach(evt =>
  dropzone.addEventListener(evt, e => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  })
);
["dragleave", "drop"].forEach(evt =>
  dropzone.addEventListener(evt, e => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  })
);
dropzone.addEventListener("drop", e => {
  const file = e.dataTransfer.files[0];
  if (file) showImage(file);
});
dropzone.addEventListener("click", () => fileInput.click());

initModel();


// =======================
// Background particles animation
// =======================
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.size = Math.random() * 3 + 1;
    this.color = `hsl(${Math.random()*360}, 100%, 50%)`;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fill();
  }
}

const particles = [];
for (let i=0;i<200;i++) particles.push(new Particle());

function animate() {
  ctx.clearRect(0,0,width,height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}
animate();
