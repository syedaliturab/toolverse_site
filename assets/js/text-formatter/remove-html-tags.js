const inputHtml = document.getElementById("inputHtml");
const outputText = document.getElementById("outputText");
const cleanBtn = document.getElementById("stripHtmlBtn");

cleanBtn.addEventListener("click", () => {
  let raw = inputHtml.value;

  if (!raw.trim()) {
    outputText.value = "";
    return;
  }

  // Remove script and style tags completely
  raw = raw.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  raw = raw.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');

  // Convert block-level tags into line breaks
  raw = raw.replace(/<\/?(div|p|section|article|header|footer|nav|ul|ol|li|table|tr|td|th|h[1-6]|br)>/gi, '\n');

  // Replace all other tags with a space
  raw = raw.replace(/<[^>]+>/g, ' ');

  // Replace multiple newlines with a single newline
  raw = raw.replace(/\n{2,}/g, '\n');

  // Replace multiple spaces with single space
  raw = raw.replace(/[ \t]+/g, ' ');

  // Split into lines, trim, and remove empty lines
  const lines = raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  // Join clean lines back
  outputText.value = lines.join('\n');
});