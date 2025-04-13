const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const formatBtn = document.getElementById("formatBtn");
const spaceRange = document.getElementById("spaceCount");
const spaceDisplay = document.getElementById("spaceDisplay");

const removeSpaces = document.getElementById("removeSpaces");
const removeLineBreaks = document.getElementById("removeLineBreaks");
const removeEmptyLines = document.getElementById("removeEmptyLines");
const trimLineEdges = document.getElementById("trimLineEdges");

spaceRange.addEventListener("input", () => {
  spaceDisplay.textContent = spaceRange.value;
});

formatBtn.addEventListener("click", () => {
  const input = inputText.value;
  const maxSpaces = parseInt(spaceRange.value, 10);

  if (!input.trim()) {
    outputText.value = "";
    return;
  }

  let lines = input.split(/\r?\n/);

  lines = lines.map(line => {
    let processedLine = line;

    // Trim edges if enabled
    if (trimLineEdges.checked) {
      processedLine = processedLine.trim();
    }

    // Replace extra spaces if enabled
    if (removeSpaces.checked) {
      processedLine = processedLine.replace(/\s+/g, " ".repeat(maxSpaces));
    }

    return processedLine;
  });

  // Remove empty lines
  if (removeEmptyLines.checked) {
    lines = lines.filter(line => line.trim() !== "");
  }

  // Join output
  const output = removeLineBreaks.checked ? lines.join(" ") : lines.join("\n");
  outputText.value = output;
});