'use strict';

class QuizApp {
  constructor() {
    this.category = document.documentElement.dataset.category;
    this.data = null;
    this.currentIndex = 0;
    this.score = 0;
    this.app = document.getElementById('quiz-app');
    this.init();
  }

  async init() {
    this.app.innerHTML = '<div class="loading">Yükleniyor ✨</div>';
    try {
      const res = await fetch(`../data/${this.category}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.data = await res.json();
      this.applyTheme();
      this.showIntro();
    } catch {
      this.app.innerHTML = '<div class="error">Quiz yüklenemedi. Lütfen sayfayı yenileyin. 😔</div>';
    }
  }

  applyTheme() {
    const t = this.data.theme;
    const r = document.documentElement;
    r.style.setProperty('--bg', t.bgGradient);
    r.style.setProperty('--surface', t.surface);
    r.style.setProperty('--surface-hover', t.surfaceHover);
    r.style.setProperty('--accent', t.accent);
    r.style.setProperty('--accent-dark', t.accentDark);
    r.style.setProperty('--text', t.text);
    r.style.setProperty('--text-muted', t.textMuted);
    r.style.setProperty('--option-hover', t.optionHover);
    r.style.setProperty('--option-correct', t.optionCorrect);
    r.style.setProperty('--option-wrong', t.optionWrong);
    document.title = `${this.data.title} | Quiz`;
  }

  showIntro() {
    this.app.innerHTML = `
      <div class="card fade-in">
        <img class="intro-img" src="${this.data.image}" alt="${this.data.title}" />
        <h1 class="intro-title">${this.data.title}</h1>
        <p class="intro-sub">${this.data.subtitle}</p>
        <span class="intro-count">📝 ${this.data.questions.length} soru</span>
        <button class="btn primary-btn" id="startBtn">Quiz'e Başla 🚀</button>
      </div>
    `;
    document.getElementById('startBtn').onclick = () => {
      this.currentIndex = 0;
      this.score = 0;
      this.showQuestion();
    };
  }

  showQuestion() {
    const q = this.data.questions[this.currentIndex];
    const total = this.data.questions.length;
    const pct = (this.currentIndex / total) * 100;

    this.app.innerHTML = `
      <div class="card fade-in">
        <div class="progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${pct}%"></div>
          </div>
          <div class="progress-label">Soru ${this.currentIndex + 1} / ${total}</div>
        </div>

        <p class="question-text">${q.question}</p>

        <div class="options" id="options">
          ${['a', 'b', 'c', 'd'].map(k => `
            <button class="option-btn" data-key="${k}">
              <span class="option-label">${k.toUpperCase()}</span>
              <span>${q.options[k]}</span>
            </button>
          `).join('')}
        </div>

        <div class="feedback-wrap" id="feedbackWrap"></div>
      </div>
    `;

    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.onclick = () => this.answer(btn.dataset.key, q);
    });
  }

  answer(selected, q) {
    const isCorrect = selected === q.correct;
    if (isCorrect) this.score++;

    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.key === q.correct) {
        btn.classList.add('correct');
      } else if (btn.dataset.key === selected && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    document.getElementById('feedbackWrap').innerHTML = `
      <div class="feedback ${isCorrect ? 'fb-correct' : 'fb-wrong'}">
        ${isCorrect
          ? '✅ Doğru cevap!'
          : `❌ Yanlış! Doğru cevap: <strong>${q.correct.toUpperCase()}</strong>`
        }
      </div>
    `;

    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex < this.data.questions.length) {
        this.showQuestion();
      } else {
        this.showResult();
      }
    }, 1400);
  }

  getResult() {
    const s = this.score;
    const { results } = this.data;
    if (s >= results.perfect.min) return results.perfect;
    if (s >= results.great.min)   return results.great;
    if (s >= results.ok.min)      return results.ok;
    return results.zero;
  }

  showResult() {
    const r = this.getResult();
    const total = this.data.questions.length;

    this.app.innerHTML = `
      <div class="card result-card fade-in">
        <div class="confetti" id="confetti" aria-hidden="true"></div>
        <img class="result-img" src="${this.data.image}" alt="${this.data.title}" />
        <div class="result-tier">${r.emoji}</div>
        <h2 class="result-title">${r.title}</h2>
        <div class="result-score">${this.score} <span>/ ${total}</span></div>
        <p class="result-msg">${r.message}</p>
        <div class="result-actions">
          <button class="btn primary-btn" id="retryBtn">🔄 Tekrar Dene</button>
          <a class="btn secondary-btn" href="/">🏠 Ana Sayfa</a>
        </div>
      </div>
    `;

    document.getElementById('retryBtn').onclick = () => {
      this.currentIndex = 0;
      this.score = 0;
      this.showQuestion();
    };

    this.spawnConfetti();
  }

  spawnConfetti() {
    const container = document.getElementById('confetti');
    const emojis = ['🎉', '🎊', '✨', '🎈', '🌟', '💫', '🎁', '🥳', '🎀', '⭐', '🪄', '🎶'];
    for (let i = 0; i < 28; i++) {
      const el = document.createElement('span');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = `${Math.random() * 100}%`;
      el.style.fontSize = `${Math.random() * 16 + 10}px`;
      el.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
      el.style.animationDelay = `${Math.random() * 0.8}s`;
      container.appendChild(el);
    }
  }
}

new QuizApp();
