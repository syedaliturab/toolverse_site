const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const addNumbersBtn = document.getElementById("addNumbersBtn");

addNumbersBtn.addEventListener("click", () => {
  const lines = inputText.value.split("\n");
  const skipEmpty = document.getElementById("skipEmptyLines").checked;
  const leadingZeros = document.getElementById("leadingZeros").checked;
  const preserveIndentation = document.getElementById("preserveIndentation").checked;
  const startFrom = parseInt(document.getElementById("startFrom").value, 10) || 1;
  const position = document.querySelector('input[name="position"]:checked').value;

  let result = [];
  let count = startFrom;

  for (let line of lines) {
    const isEmpty = line.trim() === "";
    const indent = preserveIndentation ? line.match(/^\s*/)?.[0] || "" : "";

    if (skipEmpty && isEmpty) {
      result.push(line);
      continue;
    }

    const num = leadingZeros ? String(count).padStart(2, "0") : count;
    const numberedLine =
      position === "start"
        ? `${indent}${num} ${line.trim()}`
        : `${indent}${line.trim()} ${num}`;

    result.push(numberedLine);
    count++;
  }

  outputText.value = result.join("\n");
});