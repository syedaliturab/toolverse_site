// ../../assets/js/text-analyzer/basic-counters.js

document.addEventListener("DOMContentLoaded", function () {
    const inputText = document.getElementById("inputText");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const resultStats = document.getElementById("resultStats");
  
    const wordCount = document.getElementById("wordCount");
    const charCount = document.getElementById("charCount");
    const charCountNoSpaces = document.getElementById("charCountNoSpaces");
    const lineCount = document.getElementById("lineCount");
    const paragraphCount = document.getElementById("paragraphCount");
    const sentenceCount = document.getElementById("sentenceCount");
  
    function countText(text) {
      const words = text.trim().match(/\b\w+\b/g) || [];
  
      // Characters (with spaces includes \n and \r)
      const charsWithSpaces = text.length;
  
      // Characters (without spaces, but still includes line breaks)
      const charsNoSpaces = text.replace(/\s/g, '').length;
  
      // Lines including all lines (even empty ones)
      const allLines = text.split(/\r\n|\r|\n/);
      const nonEmptyLines = allLines.filter(line => line.trim() !== '');
  
      // Paragraphs = text separated by two or more line breaks
      const paragraphs = text.trim().split(/\n\s*\n/).filter(para => para.trim() !== '').length;
  
      // Sentences (split by ., !, ?)
      const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim() !== '').length;
  
      return {
        words: words.length,
        charsWithSpaces,
        charsNoSpaces,
        lines: nonEmptyLines.length, // ✅ non-empty lines counted
        paragraphs,
        sentences
      };
    }
  
    analyzeBtn.addEventListener("click", function () {
      const text = inputText.value;
  
      if (text.trim() === "") {
        alert("Please paste or type some text to analyze.");
        return;
      }
  
      const stats = countText(text);
  
      wordCount.textContent = stats.words;
      charCount.textContent = stats.charsWithSpaces;
      charCountNoSpaces.textContent = stats.charsNoSpaces;
      lineCount.textContent = stats.lines;
      paragraphCount.textContent = stats.paragraphs;
      sentenceCount.textContent = stats.sentences;
  
      resultStats.style.display = "block";
    });
  });