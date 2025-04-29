// ../../assets/js/text-analyzer/text-complexity.js

document.addEventListener("DOMContentLoaded", function () {
    const inputText = document.getElementById("inputText");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const resultStats = document.getElementById("resultStats");
  
    const avgWordLength = document.getElementById("avgWordLength");
    const avgSentenceLength = document.getElementById("avgSentenceLength");
    const lexicalDiversity = document.getElementById("lexicalDiversity");
  
    function cleanText(text) {
      return text.replace(/[^a-zA-Z0-9\s.!?]/g, '').replace(/\s+/g, ' ').trim();
    }
  
    function splitIntoWords(text) {
      return text
        .replace(/[.!?]/g, '') // Remove sentence enders
        .split(/\s+/)
        .map(word => word.trim().toLowerCase())
        .filter(word => word.length > 0);
    }
  
    function splitIntoSentences(text) {
      return text
        .split(/[.!?]+/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0);
    }
  
    function calculateAvgWordLength(words) {
      if (words.length === 0) return 0;
      const totalCharacters = words.reduce((acc, word) => acc + word.length, 0);
      return (totalCharacters / words.length).toFixed(2);
    }
  
    function calculateAvgSentenceLength(sentences, words) {
      if (sentences.length === 0) return 0;
      return (words.length / sentences.length).toFixed(2);
    }
  
    function calculateLexicalDiversity(words) {
      if (words.length === 0) return 0;
      const wordCount = words.length;
      const uniqueWordSet = new Set(words);
      const uniqueWordCount = uniqueWordSet.size;
      const diversity = (uniqueWordCount / wordCount) * 100;
      return diversity.toFixed(2);
    }
  
    analyzeBtn.addEventListener("click", function () {
      const rawText = inputText.value.trim();
  
      if (rawText === "") {
        alert("Please paste or type some text to analyze.");
        return;
      }
  
      const cleanedText = cleanText(rawText);
  
      const words = splitIntoWords(cleanedText);
      const sentences = splitIntoSentences(cleanedText);
  
      const wordLengthAvg = calculateAvgWordLength(words);
      const sentenceLengthAvg = calculateAvgSentenceLength(sentences, words);
      const diversity = calculateLexicalDiversity(words);
  
      avgWordLength.textContent = wordLengthAvg;
      avgSentenceLength.textContent = sentenceLengthAvg;
      lexicalDiversity.textContent = `${diversity}%`;
  
      resultStats.style.display = "block";
    });
  });