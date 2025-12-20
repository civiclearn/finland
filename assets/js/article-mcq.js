/* =====================================================
   ARTICLE MCQ ENGINE
   Scope: article pages
   Features:
   - Inline MCQs
   - Self-check MCQ groups
   - Global site-wide answered counter
===================================================== */

const ANSWERED_STORAGE_KEY = "civiclearn_answered_mcqs";

/* =========================
   BOOT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  if (!window.CIVICLEARN_QUESTIONS) return;

  renderInlineMCQs();
  renderSelfCheckGroups();
  initGlobalCounter();
});

/* =========================
   STORAGE
========================= */
function getAnsweredSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(ANSWERED_STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveAnsweredSet(set) {
  localStorage.setItem(ANSWERED_STORAGE_KEY, JSON.stringify([...set]));
}

/* =========================
   INLINE MCQs
========================= */
function renderInlineMCQs() {
  document.querySelectorAll(".inline-mcq").forEach(container => {
    const id = container.dataset.mcqId;
    const qData = window.CIVICLEARN_QUESTIONS[id];

    if (!qData) {
      container.innerHTML = "<p>Question unavailable.</p>";
      return;
    }

    renderMCQ(container, qData);
  });
}

/* =========================
   SELF-CHECK GROUPS
========================= */
function renderSelfCheckGroups() {
  document.querySelectorAll(".selfcheck-mcq-group").forEach(group => {

    /* explicit IDs */
    if (group.dataset.ids) {
      const ids = group.dataset.ids
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      ids.forEach(id => {
        const qData = window.CIVICLEARN_QUESTIONS[id];
        if (!qData) return;

        const container = document.createElement("div");
        container.className = "inline-mcq";
        renderMCQ(container, qData);
        group.appendChild(container);
      });

      return;
    }

    /* topic + limit */
    const topic = group.dataset.topic || "mixed";
    const limit = parseInt(group.dataset.limit || "3", 10);

    const pool = Object.values(window.CIVICLEARN_QUESTIONS)
      .filter(q => topic === "mixed" || q.topic === topic)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    if (!pool.length) {
      const section = group.closest(".article-selfcheck");
      if (section) section.style.display = "none";
      return;
    }

    pool.forEach(qData => {
      const container = document.createElement("div");
      container.className = "inline-mcq";
      renderMCQ(container, qData);
      group.appendChild(container);
    });
  });
}

/* =========================
   MCQ RENDERING
========================= */
function renderMCQ(container, qData) {
  if (!qData || !Array.isArray(qData.options)) return;

  container.innerHTML = "";
  container.dataset.mcqId = qData.id;
  container.dataset.answered = "false";

  const question = document.createElement("div");
  question.className = "mcq-question";
  question.textContent = qData.q;
  container.appendChild(question);

  qData.options.forEach((text, index) => {
    const option = document.createElement("div");
    option.className = "mcq-option";
    option.textContent = text;

    option.addEventListener("click", () => {
      if (container.dataset.answered === "true") return;

      container.dataset.answered = "true";

      const options = container.querySelectorAll(".mcq-option");

      options.forEach((opt, i) => {
        if (i === qData.correctIndex) opt.classList.add("correct");
        else if (i === index) opt.classList.add("wrong");
      });

      if (qData.feedback) {
        const feedback = document.createElement("div");
        feedback.className = "mcq-feedback";
        feedback.textContent = qData.feedback;
        container.appendChild(feedback);
      }

      /* global unique counter */
      const answeredSet = getAnsweredSet();
      if (!answeredSet.has(qData.id)) {
        answeredSet.add(qData.id);
        saveAnsweredSet(answeredSet);
        updateCounterUI(answeredSet.size);
      }
    });

    container.appendChild(option);
  });
}

/* =========================
   GLOBAL COUNTER
========================= */
function initGlobalCounter() {
  const answeredSet = getAnsweredSet();
  updateCounterUI(answeredSet.size);
}

function updateCounterUI(count) {
  const el = document.getElementById("questionCounter");
  if (!el) return;
  el.textContent = `Questions answered: ${count}`;
}
