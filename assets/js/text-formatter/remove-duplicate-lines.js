const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const highlightedOutput = document.getElementById("highlightedOutput");
const removeBtn = document.getElementById("removeDuplicatesBtn");
const ignoreWhitespace = document.getElementById("ignoreWhitespace");
const treatSentences = document.getElementById("compareBySentence");

removeBtn.addEventListener("click", () => {
  const input = inputText.value;

  // Store original structure
  const originalLines = input.split('\n');

  const seen = new Set();
  const cleanedLines = [];
  const highlighted = [];

  for (let line of originalLines) {
    let parts = [line];

    // Sentence mode: split the line by sentence boundaries (., !, ? followed by space or end)
    if (treatSentences.checked) {
      parts = line.split(/(?<=[.?!])\s+/g);
    }

    const processedParts = parts.map(part => {
      const compareKey = ignoreWhitespace.checked ? part.trim() : part;

      if (!seen.has(compareKey) && compareKey !== '') {
        seen.add(compareKey);
        return `<span>${part}</span>`;
      } else if (compareKey !== '') {
        return `<span style="background-color: #ffe5e5;">${part}</span>`;
      } else {
        return '';
      }
    });

    const reconstructedLine = processedParts.join(' ');
    cleanedLines.push(
      processedParts
        .filter(p => !p.includes('background-color')) // keep only non-duplicate lines
        .map(p => p.replace(/<\/?span.*?>/g, '')) // remove span for final output
        .join(' ')
    );

    highlighted.push(reconstructedLine);
  }

  outputText.value = cleanedLines.filter(Boolean).join('\n');
  highlightedOutput.innerHTML = highlighted.filter(Boolean).join('\n');
});