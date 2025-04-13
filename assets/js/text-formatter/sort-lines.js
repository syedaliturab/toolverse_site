const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const sortLinesBtn = document.getElementById("sortLinesBtn");

const sortAsc = document.getElementById("sortAsc");
const sortDesc = document.getElementById("sortDesc");
const ignoreCase = document.getElementById("ignoreCase");
const trimLines = document.getElementById("trimLines");

sortLinesBtn.addEventListener("click", () => {
  const input = inputText.value;

  if (!input.trim()) {
    outputText.value = "";
    return;
  }

  let lines = input.split("\n");

  if (trimLines.checked) {
    lines = lines.map(line => line.trim());
  }

  lines.sort((a, b) => {
    if (ignoreCase.checked) {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }

    return a.localeCompare(b);
  });

  if (sortDesc.checked) {
    lines.reverse();
  }

  outputText.value = lines.join("\n");
});