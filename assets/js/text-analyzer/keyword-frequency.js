// ../../assets/js/text-analyzer/keyword-frequency.js

document.addEventListener("DOMContentLoaded", function () {
    const inputText = document.getElementById("inputText");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const resultStats = document.getElementById("resultStats");
    const wordList = document.getElementById("wordList");
  
    function cleanText(text) {
      return text.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
    }
  
    function getWordFrequencies(words) {
      const freq = {};
      words.forEach(word => {
        freq[word] = (freq[word] || 0) + 1;
      });
      return freq;
    }
  
    analyzeBtn.addEventListener("click", function () {
      const rawText = inputText.value.trim();
  
      if (rawText === "") {
        alert("Please paste or type some text to analyze.");
        return;
      }
  
      const cleaned = cleanText(rawText);
      const words = cleaned.split(/\s+/).filter(word => word.length > 0);
  
      const frequencies = getWordFrequencies(words);
      const sorted = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
  
      wordList.innerHTML = "";
      sorted.forEach(([word, count]) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `<span>${word}</span><span class="badge bg-primary rounded-pill">${count}</span>`;
        wordList.appendChild(li);
      });
  
      resultStats.style.display = "block";
    });
  });