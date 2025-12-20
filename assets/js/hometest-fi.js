// hometest-fi.js
// Final, clean version

document.addEventListener("DOMContentLoaded", () => {
  const ROOT = document.getElementById("practice-demo");
  if (!ROOT) return;

  const container = document.getElementById("inline-test-questions");
  const statusText = document.getElementById("inline-status-text");

  const QUESTIONS_PER_ROW = 3;

let TOTAL_QUESTIONS = 9;

if (window.location.pathname.startsWith("/questions")) {
  TOTAL_QUESTIONS = 15;
}


  // ----------------------------
  // LOAD QUESTION BANK
  // ----------------------------
  const ALL_QUESTIONS = Object.values(window.CIVICLEARN_QUESTIONS || []);
  if (!ALL_QUESTIONS.length) return;

  shuffleArray(ALL_QUESTIONS);
  const QUESTIONS = ALL_QUESTIONS.slice(0, TOTAL_QUESTIONS);

  // ----------------------------
  // STATE
  // ----------------------------
  let answeredCount = 0;
  let correctCount = 0;
  let currentRow = 0;

  // ----------------------------
  // PREPARE QUESTIONS
  // ----------------------------
  QUESTIONS.forEach(shuffleAnswers);

  const rows = [];
  for (let i = 0; i < QUESTIONS.length; i += QUESTIONS_PER_ROW) {
    rows.push(QUESTIONS.slice(i, i + QUESTIONS_PER_ROW));
  }

  // ----------------------------
  // UI HELPERS
  // ----------------------------
  function updateStatus() {
    if (statusText) {
      statusText.textContent =
        `Questions answered: ${answeredCount} / ${QUESTIONS.length}`;
    }
  }

  function renderRow(rowIndex) {
    if (!rows[rowIndex]) return;
    rows[rowIndex].forEach((q, offset) => {
      const absoluteIndex = rowIndex * QUESTIONS_PER_ROW + offset;
      container.appendChild(createQuestionCard(q, absoluteIndex));
    });
  }

  function createQuestionCard(q, absoluteIndex) {
    const card = document.createElement("div");
    card.className = "inline-question-card";

    const badge = document.createElement("div");
    badge.className = "topic-badge";
    badge.textContent = q.topic;

    const title = document.createElement("h3");
    title.textContent = q.q;

    const feedbackWrap = document.createElement("div");
    feedbackWrap.className = "inline-feedback-wrap";

    const feedback = document.createElement("div");
    feedback.className = "inline-feedback";

    card.appendChild(badge);
    card.appendChild(title);

    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "inline-option-btn";
      btn.textContent = opt;

      btn.addEventListener("click", () => {
        if (btn.disabled) return;

        answeredCount++;
        updateStatus();

        const buttons = card.querySelectorAll("button");

        buttons.forEach((b, idx) => {
          if (idx === q.correctIndex) {
            b.classList.add("is-correct");
          }
          b.disabled = true;
        });

        if (i === q.correctIndex) {
          correctCount++;
          btn.classList.add("is-correct");
          feedback.textContent = q.feedback || "Correct.";
          feedback.classList.add("inline-correct");
        } else {
          btn.classList.add("is-wrong");
          feedback.textContent = q.feedback || "Incorrect.";
          feedback.classList.add("inline-wrong");
        }

        feedbackWrap.appendChild(feedback);
        card.appendChild(feedbackWrap);

        const isLast = absoluteIndex === QUESTIONS.length - 1;
        const endOfRow =
          (absoluteIndex + 1) % QUESTIONS_PER_ROW === 0 && !isLast;

        if (endOfRow) {
          currentRow++;
          renderRow(currentRow);
        }

        if (isLast) {
          setTimeout(renderEndCard, 400);
        }
      });

      card.appendChild(btn);
    });

    return card;
  }

  function renderEndCard() {
  const card = document.createElement("div");
  card.className = "inline-end-card";
  card.innerHTML = `
    <h3>Practice questions completed</h3>
    <p>
      You have answered a selection of civic knowledge questions
      covering different aspects of Finnish society.
      These questions illustrate the type and level of knowledge
      commonly expected in citizenship and integration contexts,
      but they do not represent the full scope of topics.
    </p>
    <a href="/articles/" class="inline-end-link">
      Browse study topics →
    </a>
  `;
  container.appendChild(card);
}


  // ----------------------------
  // UTILITIES
  // ----------------------------
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function shuffleAnswers(q) {
    const combined = q.options.map((text, idx) => ({
      text,
      correct: idx === q.correctIndex
    }));

    shuffleArray(combined);

    q.options = combined.map(o => o.text);
    q.correctIndex = combined.findIndex(o => o.correct);
  }

  // ----------------------------
  // INIT
  // ----------------------------
  updateStatus();
  renderRow(0);
});
