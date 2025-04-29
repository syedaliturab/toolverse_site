// ../../assets/js/text-analyzer/ngram-finder.js

document.addEventListener("DOMContentLoaded", function () {
    const inputText = document.getElementById("inputText");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const resultStats = document.getElementById("resultStats");
    const bigramList = document.getElementById("bigramList");
    const trigramList = document.getElementById("trigramList");
  
    function cleanText(text) {
      return text.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
    }
  
    function getNgrams(words, n) {
      const ngrams = {};
      for (let i = 0; i <= words.length - n; i++) {
        const gram = words.slice(i, i + n).join(' ');
        ngrams[gram] = (ngrams[gram] || 0) + 1;
      }
      return ngrams;
    }
  
    function populateList(listElement, ngrams) {
      listElement.innerHTML = '';
      const sorted = Object.entries(ngrams).sort((a, b) => b[1] - a[1]);
      sorted.forEach(([gram, count]) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `<span>${gram}</span><span class="badge bg-primary rounded-pill">${count}</span>`;
        listElement.appendChild(li);
      });
    }
  
    analyzeBtn.addEventListener("click", function () {
      const rawText = inputText.value.trim();
      if (rawText === "") {
        alert("Please paste or type some text to analyze.");
        return;
      }
  
      const cleaned = cleanText(rawText);
      const words = cleaned.split(/\s+/).filter(word => word.length > 0);
  
      const bigrams = getNgrams(words, 2);
      const trigrams = getNgrams(words, 3);
  
      populateList(bigramList, bigrams);
      populateList(trigramList, trigrams);
  
      resultStats.style.display = "block";
    });
  });