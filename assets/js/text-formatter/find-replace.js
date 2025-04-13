const inputText = document.getElementById("inputText");
const outputDiv = document.getElementById("highlightPreview");
const findText = document.getElementById("findText");
const replaceText = document.getElementById("replaceText");
const caseSensitive = document.getElementById("caseSensitive");
const modeSimple = document.getElementById("modeSimple");

const matchCount = document.getElementById("matchCount");
const findBtn = document.getElementById("findBtn");
const nextBtn = document.getElementById("nextMatch");
const prevBtn = document.getElementById("prevMatch");
const resetBtn = document.getElementById("resetBtn");

const replaceBtn = document.getElementById("replaceBtn");
const replaceAllBtn = document.getElementById("replaceAllBtn");

let matches = [];
let currentMatchIndex = 0;
let originalInput = ""; // 🆕 store original input

// Escape special characters for simple match mode
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build regex based on selected match mode
function buildRegex(find, flags) {
  return modeSimple.checked
    ? new RegExp(escapeRegExp(find), flags)
    : new RegExp(find, flags);
}

// Update match preview
function updatePreview() {
  const text = inputText.value;
  const find = findText.value;

  if (!originalInput) originalInput = text;

  if (!find) {
    outputDiv.innerText = text;
    matchCount.textContent = "0 matches";
    matches = [];
    return;
  }

  const flags = caseSensitive.checked ? "g" : "gi";
  const regex = buildRegex(find, flags);
  matches = [...text.matchAll(regex)];

  matchCount.textContent = `${matches.length} match${matches.length !== 1 ? "es" : ""}`;

  if (matches.length === 0) {
    outputDiv.innerText = text;
    return;
  }

  let highlighted = "";
  let lastIndex = 0;
  let scrollTargetId = "";

  matches.forEach((match, i) => {
    highlighted += text.slice(lastIndex, match.index);
    const markId = `match-${i}`;
    if (i === currentMatchIndex) scrollTargetId = markId;

    highlighted += `<mark id="${markId}" class="${i === currentMatchIndex ? 'active' : ''}" style="background:${
      i === currentMatchIndex ? '#ffd700' : '#a2d5f2'
    }; padding:2px; border-radius:3px;">${match[0]}</mark>`;
    lastIndex = match.index + match[0].length;
  });

  highlighted += text.slice(lastIndex);
  outputDiv.innerHTML = highlighted;

  // Scroll into view ONLY inside container, without page scroll
  setTimeout(() => {
    const active = document.getElementById(scrollTargetId);
    if (active) {
      const container = outputDiv;
      const rect = active.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
        active.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
    }
  }, 0);
}

// 🔍 Find
findBtn.addEventListener("click", () => {
  currentMatchIndex = 0;
  updatePreview();
});

// ⬇️ Next
nextBtn.addEventListener("click", () => {
  if (matches.length === 0) return;
  currentMatchIndex = (currentMatchIndex + 1) % matches.length;
  updatePreview();
});

// ⬆️ Prev
prevBtn.addEventListener("click", () => {
  if (matches.length === 0) return;
  currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
  updatePreview();
});

// 🔁 Replace current
replaceBtn.addEventListener("click", () => {
  const text = inputText.value;
  const find = findText.value;
  const replacement = replaceText.value;

  if (!find || matches.length === 0) return;

  const flags = caseSensitive.checked ? "g" : "gi";
  const regex = buildRegex(find, flags);

  let count = 0;
  const replaced = text.replace(regex, (match, offset) => {
    if (count === currentMatchIndex) {
      count++;
      return replacement;
    }
    count++;
    return match;
  });

  inputText.value = replaced;
  currentMatchIndex = 0;
  updatePreview();
});

// 🔁 Replace All
replaceAllBtn.addEventListener("click", () => {
  const text = inputText.value;
  const find = findText.value;
  const replacement = replaceText.value;

  if (!find) return;

  const flags = caseSensitive.checked ? "g" : "gi";
  const regex = buildRegex(find, flags);

  inputText.value = text.replace(regex, replacement);
  currentMatchIndex = 0;
  updatePreview();
});

// ♻️ Reset to original input
resetBtn.addEventListener("click", () => {
  findText.value = "";
  replaceText.value = "";
  inputText.value = originalInput;
  currentMatchIndex = 0;
  matches = [];
  matchCount.textContent = "0 matches";
  outputDiv.innerText = originalInput;
});