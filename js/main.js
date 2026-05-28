/**
 * K-Drama Date Invite — main interactions
 */

(function () {
  "use strict";

  const state = {
    timeFrom: "",
    timeTo: "",
    place: "",
    food: "",
    kpop: "",
    kpopTheme: "default",
    message: "",
  };

  const TOTAL_STEPS = 5;

  const HEARTS = ["💕", "💖", "💗", "💓", "🩷", "✨", "🌸", "🎀"];
  const SPARKLES = ["✨", "⭐", "🌟", "💫"];

  // ─── DOM refs ───
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const loadingScreen = $("#loading-screen");
  const app = $("#app");
  const typewriterEl = $("#typewriter");
  const btnYes = $("#btn-yes");
  const btnNo = $("#btn-no");
  const btnFinish = $("#btn-finish");
  const btnReplay = $("#btn-replay");
  const bgMusic = $("#bg-music");
  const musicToggle = $("#music-toggle");
  const confettiCanvas = $("#confetti-canvas");

  let musicLoadFailed = false;
  let userMutedMusic = false;
  let appReady = false;

  // ─── Init ───
  function init() {
    setupTimePickers();
    setupLoading();
    setupFloatingDecor();
    setupPolaroids();
    setupMusic();
    setupTypewriter();
    setupRunawayNo();
    setupLanding();
    setupWizard();
    setupReplay();
    setupRomanticQuotes();
  }

  function setupRomanticQuotes() {
    const q = CONFIG.romanticQuotes;
    if (!q) return;

    const slots = [
      { key: "landing", el: "#screen-landing .romantic-quote" },
      { key: "celebrate", el: "#screen-celebrate .romantic-quote" },
      { key: "step1", el: '.wizard-step[data-step="1"] .romantic-quote' },
      { key: "step2", el: '.wizard-step[data-step="2"] .romantic-quote' },
      { key: "step3", el: '.wizard-step[data-step="3"] .romantic-quote' },
      { key: "step4", el: '.wizard-step[data-step="4"] .romantic-quote' },
      { key: "step5", el: '.wizard-step[data-step="5"] .romantic-quote' },
      { key: "summary", el: "#screen-summary .romantic-quote" },
    ];

    slots.forEach(({ key, el }) => {
      if (!q[key]) return;
      const node = $(el);
      if (node) node.textContent = `“${q[key].replace(/^["“]|["”]$/g, "")}”`;
    });
  }

  function setupTimePickers() {
    ["from", "to"].forEach((which) => {
      const hourSel = $(`#pick-time-${which}-hour`);
      const minSel = $(`#pick-time-${which}-minute`);
      if (!hourSel || !minSel) return;

      if (!hourSel.options.length) {
        for (let h = 1; h <= 12; h++) {
          const opt = document.createElement("option");
          opt.value = String(h);
          opt.textContent = String(h);
          hourSel.appendChild(opt);
        }
      }

      if (!minSel.options.length) {
        for (let m = 0; m < 60; m++) {
          const opt = document.createElement("option");
          const val = String(m).padStart(2, "0");
          opt.value = val;
          opt.textContent = val;
          minSel.appendChild(opt);
        }
      }
    });

    setPickerFrom24("from", "18:00");
    setPickerFrom24("to", "21:00");
  }

  function setPickerFrom24(which, time24) {
    const { hour, minute, ampm } = parseTime24(time24);
    const hourSel = $(`#pick-time-${which}-hour`);
    const minSel = $(`#pick-time-${which}-minute`);
    const ampmSel = $(`#pick-time-${which}-ampm`);
    if (hourSel) hourSel.value = hour;
    if (minSel) minSel.value = minute;
    if (ampmSel) ampmSel.value = ampm;
  }

  function parseTime24(time24) {
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    return {
      hour: String(hour12),
      minute: String(m).padStart(2, "0"),
      ampm,
    };
  }

  function pickerTo24(which) {
    const hour = $(`#pick-time-${which}-hour`)?.value;
    const minute = $(`#pick-time-${which}-minute`)?.value;
    const ampm = $(`#pick-time-${which}-ampm`)?.value;
    if (!hour || !minute || !ampm) return "";
    let h = parseInt(hour, 10);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${minute}`;
  }

  function formatTimeDisplay(time24) {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatTimeRange(from, to) {
    return `${formatTimeDisplay(from)} – ${formatTimeDisplay(to)}`;
  }

  function getTimeRange() {
    return {
      from: pickerTo24("from"),
      to: pickerTo24("to"),
    };
  }

  function isValidTimeRange(from, to) {
    return from && to && from < to;
  }

  // ─── Loading (tap unlocks audio + enters site) ───
  let siteEntered = false;

  async function enterSite() {
    if (siteEntered) return;
    siteEntered = true;

    if (
      CONFIG.musicUrl &&
      CONFIG.musicAutoplay !== false &&
      !musicLoadFailed &&
      !userMutedMusic
    ) {
      await tryPlayMusic();
    }

    finishLoading();
  }

  function setupLoading() {
    const meter = $("#loading-meter");
    let p = 0;

    const go = () => enterSite();

    loadingScreen.addEventListener("pointerdown", go, { once: true });
    loadingScreen.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      },
      { once: true }
    );

    const tick = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(tick);
      }
      if (meter) meter.style.width = `${Math.min(p, 100)}%`;
    }, 120);
  }

  function finishLoading() {
    loadingScreen.classList.add("fade-out");
    loadingScreen.setAttribute("aria-hidden", "true");
    app.classList.remove("hidden");
    appReady = true;
    setTimeout(() => loadingScreen.remove(), 700);
  }

  // ─── Floating hearts & sparkles ───
  function setupFloatingDecor() {
    const heartsBox = $("#hearts-container");
    const sparklesBox = $("#sparkles-container");

    function spawn(container, chars, className, interval) {
      setInterval(() => {
        if (document.hidden) return;
        const el = document.createElement("span");
        el.className = className;
        el.textContent = chars[Math.floor(Math.random() * chars.length)];
        el.style.left = `${Math.random() * 100}%`;
        el.style.fontSize = `${0.8 + Math.random() * 1.2}rem`;
        el.style.animationDuration = `${6 + Math.random() * 6}s`;
        container.appendChild(el);
        el.addEventListener("animationend", () => el.remove());
      }, interval);
    }

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    spawn(heartsBox, HEARTS, "float-heart", isMobile ? 1500 : 900);
    spawn(sparklesBox, SPARKLES, "float-sparkle", isMobile ? 2200 : 1400);
  }

  // ─── Polaroids ───
  function setupPolaroids() {
    const container = $("#polaroids");
    const photos = CONFIG.polaroidPhotos || [];
    if (!photos.length) return;

    const positions = [
      { top: "12%", left: "5%", rot: "-8deg" },
      { top: "20%", right: "6%", rot: "10deg" },
      { bottom: "18%", left: "8%", rot: "6deg" },
      { bottom: "22%", right: "5%", rot: "-12deg" },
    ];

    photos.slice(0, 4).forEach((src, i) => {
      const pos = positions[i] || positions[0];
      const div = document.createElement("div");
      div.className = "polaroid";
      div.style.setProperty("--rot", pos.rot);
      Object.assign(div.style, {
        top: pos.top || "auto",
        left: pos.left || "auto",
        right: pos.right || "auto",
        bottom: pos.bottom || "auto",
        animationDelay: `${i * 0.5}s`,
      });
      div.innerHTML = `<img src="${src}" alt="Memory ${i + 1}" loading="lazy" /><div class="polaroid-caption">us 💕</div>`;
      container.appendChild(div);
    });

    const slideshow = $("#photo-slideshow");
    const inner = $("#slideshow-inner");
    if (slideshow && inner && photos.length) {
      slideshow.classList.remove("hidden");
      photos.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "Our moment";
        inner.appendChild(img);
      });
      let idx = 0;
      setInterval(() => {
        idx = (idx + 1) % photos.length;
        inner.style.transform = `translateX(-${idx * 100}%)`;
      }, 3500);
    }
  }

  // ─── Music ───
  function updateMusicToggleUi(isPlaying) {
    const icon = musicToggle.querySelector(".music-icon");
    if (icon) icon.textContent = isPlaying ? "🔊" : "🔇";
    musicToggle.classList.toggle("playing", isPlaying);
    musicToggle.setAttribute(
      "aria-label",
      isPlaying ? "Turn off music" : "Turn on music"
    );
    musicToggle.setAttribute(
      "title",
      isPlaying
        ? "Tap to turn music off 🎵"
        : "Tap to turn music on 🎵"
    );
  }

  async function tryPlayMusic() {
    if (musicLoadFailed || userMutedMusic || !CONFIG.musicUrl) return false;
    try {
      await bgMusic.play();
      updateMusicToggleUi(true);
      return true;
    } catch {
      updateMusicToggleUi(false);
      return false;
    }
  }

  function pauseMusic() {
    bgMusic.pause();
    updateMusicToggleUi(false);
  }

  function setupMusic() {
    if (!CONFIG.musicUrl) {
      musicToggle.classList.add("hidden");
      return;
    }

    if (CONFIG.musicLabel) {
      const label = musicToggle.querySelector(".music-label");
      if (label) label.textContent = CONFIG.musicLabel;
    }

    bgMusic.src = CONFIG.musicUrl;
    bgMusic.volume = 0.4;
    bgMusic.loop = true;
    bgMusic.preload = "auto";
    bgMusic.load();

    updateMusicToggleUi(false);

    bgMusic.addEventListener("error", () => {
      musicLoadFailed = true;
      updateMusicToggleUi(false);
      console.warn(
        "[Date Invite] Music file not found. Add Goblin OST MP3 to:",
        CONFIG.musicUrl
      );
    });

    musicToggle.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (musicLoadFailed) {
        alert(
          "Music file missing 💕\n\nAdd Goblin OST (Stay With Me) as:\nassets/audio/goblin-stay-with-me.mp3\n\nSee assets/audio/README.md"
        );
        return;
      }

      if (!bgMusic.paused) {
        userMutedMusic = true;
        pauseMusic();
        return;
      }

      userMutedMusic = false;
      await tryPlayMusic();
    });
  }

  // ─── Typewriter ───
  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderTypewriterHtml(shown, name, full) {
    const nameStart = full.indexOf(name);
    const nameEnd = nameStart + name.length;

    let html;
    if (nameStart === -1 || shown.length <= nameStart) {
      html = escapeHtml(shown);
    } else {
      const before = shown.slice(0, nameStart);
      const nameShown = shown.slice(nameStart, Math.min(shown.length, nameEnd));
      const after = shown.slice(nameEnd);
      html =
        escapeHtml(before) +
        `<span class="name-cute">${escapeHtml(nameShown)}</span>` +
        escapeHtml(after);
    }
    return html.replace(/\n/g, "<br>");
  }

  function setupTypewriter() {
    const name = CONFIG.herName || "beautiful";
    const when = CONFIG.dateLabel || "this Friday";
    const lines = [
      `Hey ${name}… 💕\n`,
      `Will you go on a date with me ${when}? ✨`,
    ];
    const full = lines.join("");
    let i = 0;

    function type() {
      if (i <= full.length) {
        const shown = full.slice(0, i);
        typewriterEl.innerHTML =
          renderTypewriterHtml(shown, name, full) +
          '<span class="typewriter-cursor"></span>';
        i++;
        setTimeout(type, i < 20 ? 55 : 38);
      } else {
        typewriterEl.innerHTML = renderTypewriterHtml(full, name, full);
      }
    }
    setTimeout(type, 600);
  }

  // ─── Runaway No button (starts beside Yes, then moves inside card) ───
  function setupRunawayNo() {
    const card = $("#landing-card");
    let isRunaway = false;
    let lastMove = 0;

    function getBounds() {
      const pad = 14;
      const w = btnNo.offsetWidth || 90;
      const h = btnNo.offsetHeight || 44;
      const maxX = Math.max(pad, card.clientWidth - w - pad);
      const maxY = Math.max(pad, card.clientHeight - h - pad);
      return { pad, maxX, maxY, w, h };
    }

    function clampPos(x, y) {
      const { pad, maxX, maxY } = getBounds();
      return {
        x: Math.max(pad, Math.min(x, maxX)),
        y: Math.max(pad, Math.min(y, maxY)),
      };
    }

    function setNoPosition(x, y, wobble = false) {
      const { x: cx, y: cy } = clampPos(x, y);
      btnNo.style.left = `${cx}px`;
      btnNo.style.top = `${cy}px`;
      if (wobble) {
        btnNo.style.transform = `scale(0.9) rotate(${-4 + Math.random() * 8}deg)`;
      }
    }

    function activateRunaway() {
      if (isRunaway) return;
      const cardRect = card.getBoundingClientRect();
      const noRect = btnNo.getBoundingClientRect();
      isRunaway = true;
      btnNo.classList.add("is-runaway");
      setNoPosition(noRect.left - cardRect.left, noRect.top - cardRect.top);
    }

    function resetNoHome() {
      isRunaway = false;
      btnNo.classList.remove("is-runaway");
      btnNo.style.left = "";
      btnNo.style.top = "";
      btnNo.style.transform = "";
    }

    function moveNoAway(clientX, clientY) {
      const cardRect = card.getBoundingClientRect();
      const cursorX = clientX - cardRect.left;
      const cursorY = clientY - cardRect.top;

      const { w, h } = getBounds();
      const noRect = btnNo.getBoundingClientRect();
      const cx = (isRunaway ? parseFloat(btnNo.style.left) : noRect.left - cardRect.left) + w / 2;
      const cy = (isRunaway ? parseFloat(btnNo.style.top) : noRect.top - cardRect.top) + h / 2;

      const dx = cx - cursorX;
      const dy = cy - cursorY;
      const dist = Math.hypot(dx, dy) || 1;

      if (dist > 110) return;

      if (!isRunaway) activateRunaway();

      const now = Date.now();
      if (now - lastMove < 120) return;
      lastMove = now;

      const currentX = parseFloat(btnNo.style.left) || 0;
      const currentY = parseFloat(btnNo.style.top) || 0;
      const strength = Math.min(42, (110 - dist) * 0.35);
      let nx = currentX + (dx / dist) * strength;
      let ny = currentY + (dy / dist) * strength;

      setNoPosition(nx, ny, true);
    }

    function randomDart() {
      if (!isRunaway) activateRunaway();
      const { pad, maxX, maxY } = getBounds();
      const x = pad + Math.random() * (maxX - pad);
      const y = pad + Math.random() * (maxY - pad);
      setNoPosition(x, y, true);
    }

    btnNo.addEventListener("mouseenter", () => {
      if (!isRunaway) activateRunaway();
      btnNo.style.transform = "scale(0.88) rotate(-6deg)";
      randomDart();
    });

    btnNo.addEventListener("click", (e) => {
      e.preventDefault();
      randomDart();
      showFlirtToast();
    });

    document.addEventListener("mousemove", (e) => {
      if (!$("#screen-landing").classList.contains("hidden")) {
        moveNoAway(e.clientX, e.clientY);
      }
    });

    document.addEventListener(
      "touchmove",
      (e) => {
        if (
          !$("#screen-landing").classList.contains("hidden") &&
          e.touches[0]
        ) {
          moveNoAway(e.touches[0].clientX, e.touches[0].clientY);
        }
      },
      { passive: true }
    );

    function reclampNoButton() {
      if (!isRunaway) return;
      const x = parseFloat(btnNo.style.left) || 0;
      const y = parseFloat(btnNo.style.top) || 0;
      setNoPosition(x, y);
    }

    window.addEventListener("resize", reclampNoButton);
    window.visualViewport?.addEventListener("resize", reclampNoButton);
    window.visualViewport?.addEventListener("scroll", reclampNoButton);

    card.addEventListener("mouseleave", () => {
      if (isRunaway) btnNo.style.transform = "";
    });

    btnNo._resetHome = resetNoHome;
  }

  function showFlirtToast() {
    const msgs = [
      "Nice try… but it's a Yes day 💕",
      "The universe says Yes ✨",
      "That button is too shy 🥺",
      "Caught you — still Yes? 💖",
    ];
    const hint = document.querySelector(".flirt-hint");
    if (hint) {
      const orig = hint.textContent;
      hint.textContent = msgs[Math.floor(Math.random() * msgs.length)];
      hint.style.color = "var(--accent)";
      setTimeout(() => {
        hint.textContent = orig;
        hint.style.color = "";
      }, 2200);
    }
  }

  // ─── Landing Yes ───
  function setupLanding() {
    btnYes.addEventListener("click", () => {
      playSuccessSound();
      showScreen("celebrate");
      runConfetti();
      animateLoveMeter($("#celebrate-meter"), $("#love-meter-value"));
      setTimeout(() => showScreen("wizard"), 2800);
    });
  }

  function playSuccessSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        const t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch {
      /* audio optional */
    }
  }

  function animateLoveMeter(fillEl, valueEl) {
    if (!fillEl) return;
    let v = 0;
    const id = setInterval(() => {
      v += 4;
      if (v >= 100) {
        v = 100;
        clearInterval(id);
      }
      fillEl.style.width = `${v}%`;
      if (valueEl) valueEl.textContent = `${v}%`;
    }, 40);
  }

  // ─── Confetti ───
  function runConfetti() {
    const canvas = confettiCanvas;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#ff8fab", "#ffb3c6", "#ffc8dd", "#ffafcc", "#bde0fe", "#cdb4db", "#ffd6e8"];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: 6 + Math.random() * 8,
      h: 8 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 5,
      emoji: Math.random() > 0.7 ? HEARTS[Math.floor(Math.random() * HEARTS.length)] : null,
    }));

    let frame = 0;
    const maxFrames = 180;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += 4;
        if (p.emoji) {
          ctx.font = "18px serif";
          ctx.fillText(p.emoji, p.x, p.y);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });
      frame++;
      if (frame < maxFrames) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
  }

  // ─── Wizard ───
  function setupWizard() {
    setupOptionCards("#place-options", "place");
    setupFoodCards();
    setupKpopCards();

    $$(".btn-next").forEach((btn) => {
      btn.addEventListener("click", () => {
        const step = parseInt(btn.dataset.next, 10);
        if (!validateStep(step - 1)) return;
        goToStep(step);
      });
    });

    $$(".btn-back").forEach((btn) => {
      btn.addEventListener("click", () => goToStep(parseInt(btn.dataset.prev, 10)));
    });

    btnFinish.addEventListener("click", finishWizard);
  }

  function validateStep(step) {
    if (step === 1) {
      const { from, to } = getTimeRange();
      if (!from || !to) {
        shake($("#time-field-from"));
        shake($("#time-field-to"));
        return false;
      }
      if (!isValidTimeRange(from, to)) {
        shake($("#time-field-from"));
        shake($("#time-field-to"));
        return false;
      }
      state.timeFrom = from;
      state.timeTo = to;
      return true;
    }
    if (step === 2) {
      state.place = getPlace();
      if (!state.place) {
        shake($("#place-custom"));
        shake($("#place-options"));
        return false;
      }
      return true;
    }
    if (step === 3) {
      state.food = getFood();
      if (!state.food) {
        shake($("#food-custom"));
        shake($("#food-options"));
        return false;
      }
      return true;
    }
    if (step === 4) {
      state.kpop = getKpop();
      if (!state.kpop) {
        shake($("#kpop-custom"));
        return false;
      }
      return true;
    }
    if (step === 5) {
      state.message = getMessage();
      return true;
    }
    return true;
  }

  function getMessage() {
    return $("#date-message")?.value.trim() || "";
  }

  function getPlace() {
    const custom = $("#place-custom").value.trim();
    const selected = document.querySelector("#place-options .selected");
    return custom || (selected ? selected.dataset.value : "");
  }

  function getFood() {
    const selected = [...document.querySelectorAll("#food-options .selected")].map(
      (btn) => btn.dataset.value
    );
    const custom = $("#food-custom").value.trim();
    const parts = [...selected];
    if (custom) parts.push(custom);
    return parts.join(", ");
  }

  function setupFoodCards() {
    $("#food-options")?.querySelectorAll(".food-card").forEach((btn) => {
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => {
        setOptionSelected(btn, !btn.classList.contains("selected"));
      });
    });
  }

  function getKpop() {
    const selected = document.querySelector("#kpop-options .selected");
    const custom = $("#kpop-custom").value.trim();
    return custom || (selected ? selected.dataset.value : "");
  }

  function setOptionSelected(btn, isSelected) {
    btn.classList.toggle("selected", isSelected);
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
  }

  function setupOptionCards(containerSel, field) {
    const container = $(containerSel);
    if (!container) return;
    container.querySelectorAll("button").forEach((btn) => {
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => {
        container.querySelectorAll("button").forEach((b) => setOptionSelected(b, false));
        setOptionSelected(btn, true);
        if (field === "place") $("#place-custom").value = "";
      });
    });
    const customId = field === "place" ? "#place-custom" : null;
    if (customId) {
      $(customId)?.addEventListener("input", () => {
        container.querySelectorAll("button").forEach((b) => setOptionSelected(b, false));
      });
    }
  }

  function setupKpopCards() {
    $("#kpop-options")?.querySelectorAll(".kpop-card").forEach((btn) => {
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => {
        $("#kpop-options").querySelectorAll(".kpop-card").forEach((b) => setOptionSelected(b, false));
        setOptionSelected(btn, true);
        $("#kpop-custom").value = "";
        const theme = btn.dataset.theme || "default";
        state.kpopTheme = theme;
        document.body.setAttribute("data-theme", theme);
      });
    });
    $("#kpop-custom")?.addEventListener("input", () => {
      $("#kpop-options")?.querySelectorAll(".kpop-card").forEach((b) => setOptionSelected(b, false));
      document.body.setAttribute("data-theme", "default");
      state.kpopTheme = "default";
    });
  }

  function goToStep(n) {
    $$(".wizard-step").forEach((s) => s.classList.remove("active"));
    const stepEl = $(`.wizard-step[data-step="${n}"]`);
    stepEl?.classList.add("active");
    $("#current-step-num").textContent = String(n);
    const totalEl = $("#total-step-count");
    if (totalEl) totalEl.textContent = String(TOTAL_STEPS);

    const wizardCard = $(".wizard-card");
    if (wizardCard) wizardCard.scrollTop = 0;
    if (window.matchMedia("(max-width: 768px)").matches) {
      requestAnimationFrame(() => {
        stepEl?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    }
    $$(".progress-dots .dot").forEach((d) => {
      const sn = parseInt(d.dataset.step, 10);
      d.classList.toggle("active", sn === n);
      d.classList.toggle("done", sn < n);
    });
  }

  function shake(el) {
    if (!el) return;
    el.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 350, iterations: 2 }
    );
  }

  async function finishWizard() {
    state.kpop = getKpop();
    if (!state.kpop) {
      shake($("#kpop-custom"));
      goToStep(4);
      return;
    }
    state.message = getMessage();
    const { from, to } = getTimeRange();
    if (!isValidTimeRange(from, to)) {
      shake($("#time-field-from"));
      shake($("#time-field-to"));
      goToStep(1);
      return;
    }
    state.timeFrom = from;
    state.timeTo = to;
    if (!state.place) state.place = getPlace();
    if (!state.food) state.food = getFood();

    document.body.setAttribute("data-theme", state.kpopTheme || "default");
    fillSummary();
    showScreen("summary");
    await sendEmail();
  }

  function fillSummary() {
    const formatted = formatTimeRange(state.timeFrom, state.timeTo);
    const dateLabel = CONFIG.dateLabel || "Friday";
    $("#sum-time").textContent = `${formatted} (${dateLabel})`;
    $("#sum-place").textContent = state.place;
    $("#sum-food").textContent = state.food;
    $("#sum-kpop").textContent = state.kpop;
    $("#sum-message").textContent =
      state.message || "She's keeping the mystery… 🫣💕";

    const line1 =
      CONFIG.finalMessage?.line1 ||
      "The moment I get to see you is finally real… and my heart is already racing. 💕✨🌸";
    const line2 = (
      CONFIG.finalMessage?.line2 ||
      `I seriously can't wait to spend ${CONFIG.dateLabel || "this Friday"} with you, My Queen. 🥺💖👑`
    ).replace(/\$\{dateLabel\}/g, CONFIG.dateLabel || "this Friday");
    $("#final-message").innerHTML = `${line1}<br />${line2}`;

    animateLoveMeter(
      document.querySelector("#screen-summary .love-meter-fill") ||
        createSummaryMeter(),
      null
    );
  }

  function createSummaryMeter() {
    const card = $(".summary-card");
    const wrap = document.createElement("div");
    wrap.className = "love-meter";
    wrap.innerHTML = `
      <span class="love-meter-label">Love meter</span>
      <div class="love-meter-track"><div class="love-meter-fill heartbeat"></div></div>
    `;
    card.insertBefore(wrap, $("#final-message"));
    return wrap.querySelector(".love-meter-fill");
  }

  // ─── Email (FormSubmit) ───
  function buildSubmissionPayload() {
    const timestamp = new Date().toLocaleString();
    return {
      timestamp,
      timeFrom: state.timeFrom,
      timeTo: state.timeTo,
      timeRange: formatTimeRange(state.timeFrom, state.timeTo),
      place: state.place,
      food: state.food,
      kpop: state.kpop,
      message: state.message || "(none)",
      body: `
Date Invite Response 💕
========================
Time: ${formatTimeRange(state.timeFrom, state.timeTo)}
Place: ${state.place}
Food: ${state.food}
K-pop Vibe: ${state.kpop}
Her Message: ${state.message || "(none)"}
Submitted: ${timestamp}
      `.trim(),
    };
  }

  function saveSubmissionBackup(payload) {
    try {
      localStorage.setItem("dateInviteLastSubmission", JSON.stringify(payload));
    } catch {
      /* storage unavailable */
    }
  }

  function parseFormSubmitResponse(data) {
    const success =
      data.success === true || String(data.success).toLowerCase() === "true";
    const message = data.message || "";
    const needsActivation = /activation/i.test(message);
    const needsWebServer = /web server/i.test(message);
    return { success, message, needsActivation, needsWebServer };
  }

  function showEmailSuccess(statusEl) {
    statusEl.className = "email-status success";
    statusEl.textContent =
      CONFIG.emailSuccessMessage ||
      "I got your message, My Love — your wish is my command. 💌💖✨";
  }

  async function sendEmail() {
    const statusEl = $("#email-status");
    const email = CONFIG.recipientEmail;

    if (!email || email.includes("your.email")) {
      statusEl.classList.remove("hidden");
      statusEl.className = "email-status error";
      statusEl.textContent =
        "💌 Details saved here — add your email in js/config.js to receive them automatically!";
      return;
    }

    if (window.location.protocol === "file:") {
      statusEl.classList.remove("hidden");
      statusEl.className = "email-status error";
      statusEl.textContent =
        "Open this site through a link (Netlify/GitHub Pages) or run: python3 -m http.server 8080 — emails won't send from a saved HTML file.";
      return;
    }

    const payload = buildSubmissionPayload();
    saveSubmissionBackup(payload);

    const formData = new FormData();
    formData.append("_subject", "💕 She said YES! Date details");
    formData.append("_template", "table");
    formData.append("_captcha", "false");
    formData.append("message", payload.body);
    formData.append("Time From", formatTimeDisplay(state.timeFrom));
    formData.append("Time To", formatTimeDisplay(state.timeTo));
    formData.append("Place", state.place);
    formData.append("Food", state.food);
    formData.append("K-pop Vibe", state.kpop);
    formData.append("Her Message", state.message || "(none)");
    formData.append("Timestamp", payload.timestamp);

    statusEl.classList.remove("hidden");
    statusEl.className = "email-status";
    statusEl.textContent = "Sending your sweet details… 💌";

    try {
      const res = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(email)}`,
        {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        }
      );
      const data = await res.json().catch(() => ({}));
      const parsed = parseFormSubmitResponse(data);

      if (parsed.success) {
        showEmailSuccess(statusEl);
        return;
      }

      if (parsed.needsActivation) {
        // Still show her the sweet message; you must activate FormSubmit once (see README)
        showEmailSuccess(statusEl);
        console.warn(
          "[Date Invite] FormSubmit needs activation. Check",
          email,
          "inbox/spam for an email from FormSubmit and click Activate."
        );
        return;
      }

      if (parsed.needsWebServer) {
        throw new Error("Site must be hosted on https:// or localhost, not opened as a file.");
      }

      throw new Error(parsed.message || "Send failed");
    } catch (err) {
      statusEl.className = "email-status error";
      statusEl.textContent = `Couldn't send email — but your answers are saved on screen! 💕 (${err.message || "network"})`;
      console.error("[Date Invite] Email error:", err);
    }
  }

  // ─── Screens ───
  function showScreen(id) {
    $$(".screen").forEach((s) => {
      s.classList.add("hidden");
      s.classList.remove("screen-active");
    });
    const screen = $(`#screen-${id}`);
    screen?.classList.remove("hidden");
    screen?.classList.add("screen-active");

    if (id === "landing" && btnNo._resetHome) {
      btnNo._resetHome();
    }
  }

  function setupReplay() {
    btnReplay?.addEventListener("click", () => {
      fillSummary();
      const fill = $(".summary-card .love-meter-fill");
      if (fill) {
        fill.style.width = "0%";
        animateLoveMeter(fill, null);
      }
      $(".summary-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
