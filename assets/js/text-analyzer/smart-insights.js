// ../../assets/js/text-analyzer/smart-insights.js
// ⚡ Smart Insights — Final Full Browser-AI Version (Built for 80-85% AI Behavior)

document.addEventListener("DOMContentLoaded", function () {
    const inputText = document.getElementById("inputText");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const resultStats = document.getElementById("resultStats");
    const languageResult = document.getElementById("languageResult");
    const summaryResult = document.getElementById("summaryResult");
  
    // Language profiles
    const languageProfiles = {
      "English 🇺🇸": { funcWords: ["the", "is", "and", "of", "you", "at", "by", "for", "this", "that"], diacritics: [] },
      "Spanish 🇪🇸": { funcWords: ["el", "la", "de", "que", "y", "en", "los", "una"], diacritics: ["ñ", "á", "é", "í", "ó", "ú"] },
      "French 🇫🇷": { funcWords: ["le", "la", "et", "les", "des", "est", "une", "dans"], diacritics: ["é", "è", "ê", "à", "ç"] },
      "German 🇩🇪": { funcWords: ["der", "die", "und", "ist", "das", "nicht"], diacritics: ["ä", "ö", "ü", "ß"] },
      "Hindi 🇮🇳": { funcWords: ["है", "और", "के", "से", "को", "में"], diacritics: [] },
      "Russian 🇷🇺": { funcWords: ["и", "в", "не", "он", "на"], diacritics: ["я", "ю", "ы", "ь", "ъ"] },
      "Chinese 🇨🇳": { funcWords: ["的", "了", "我", "你", "是"], diacritics: [] }
    };
  
    const stopWords = ["the", "is", "and", "or", "of", "in", "to", "for", "on", "with", "as", "this", "that", "by", "an", "be", "from", "which", "has", "have", "not"];
  
    // Step 1: Clean and Normalize text
    function cleanText(text) {
      return text.replace(/[\r\n]+/g, " ")
        .replace(/[^a-zA-Z0-9\s\u00C0-\u024F\u0400-\u04FF\u4E00-\u9FFF]/g, '')
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    }
  
    // Step 2: Detect Language (multi-criteria)
    function detectLanguage(text) {
        const words = text.split(/\s+/).filter(w => w.length > 0);
        if (words.length < 3) return "Unknown 🌐"; // not enough words
        
        const langScores = {};
      
        for (const [lang, props] of Object.entries(languageProfiles)) {
          let score = 0;
      
          props.funcWords.forEach(func => {
            score += words.filter(w => w === func).length;
          });
      
          props.diacritics.forEach(diac => {
            if (text.includes(diac)) score += 5;
          });
      
          langScores[lang] = score;
        }
      
        const sorted = Object.entries(langScores).sort((a, b) => b[1] - a[1]);
        const topLang = sorted[0];
      
        // ✨ NEW VALIDATION
        if (!topLang || topLang[1] <= 1 || words.length <= 5) {
          return "Unknown 🌐";
        }
      
        return topLang[0];
      }
    // Step 3: Split sentences
    function splitSentences(text) {
      return (text.match(/[^.!?]+[.!?]+/g) || []).map(s => s.trim()).filter(s => s.length > 8);
    }
  
    // Step 4: Build Graph of Sentences
    function buildGraph(sentences) {
      const n = sentences.length;
      const matrix = Array.from({ length: n }, () => Array(n).fill(0));
      const tokenized = sentences.map(tokenize);
  
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            const common = tokenized[i].filter(word => tokenized[j].includes(word)).length;
            const norm = Math.log(tokenized[i].length + 1) + Math.log(tokenized[j].length + 1);
            matrix[i][j] = common / norm;
          }
        }
      }
      return matrix;
    }
  
    // Step 5: Rank Sentences (TextRank)
    function calculateRanks(matrix, d = 0.85, iterations = 20) {
      const n = matrix.length;
      let ranks = Array(n).fill(1);
  
      for (let iter = 0; iter < iterations; iter++) {
        const newRanks = Array(n).fill(1 - d);
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            if (matrix[j][i] > 0) {
              newRanks[i] += d * (ranks[j] * matrix[j][i]) / matrix[j].reduce((a, b) => a + b, 0);
            }
          }
        }
        ranks = newRanks;
      }
      return ranks;
    }
  
    // Step 6: Tokenize
    function tokenize(sentence) {
      return sentence.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length > 0 && !stopWords.includes(w));
    }
  
    // Step 7: Smart Summary Generation
    function summarizeText(text) {
      const sentences = splitSentences(text);
      if (sentences.length === 0) return "Summary not available.";
  
      const matrix = buildGraph(sentences);
      const ranks = calculateRanks(matrix);
  
      const scoredSentences = sentences.map((sentence, idx) => ({
        sentence,
        score: ranks[idx]
      }));
  
      scoredSentences.sort((a, b) => b.score - a.score);
  
      // Pick top 1–2 important sentences
      const topSentences = scoredSentences.slice(0, 2).map(s => s.sentence);
      return topSentences.join(" ");
    }
  
    // Step 8: Extract Keywords
    function extractKeywords(text) {
      const words = tokenize(text);
      const freq = {};
  
      words.forEach(word => {
        if (!stopWords.includes(word)) {
          freq[word] = (freq[word] || 0) + 1;
        }
      });
  
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      return sorted.slice(0, 5).map(pair => pair[0]).join(", ");
    }
  
    analyzeBtn.addEventListener("click", function () {
      const rawText = inputText.value.trim();
      if (rawText === "") {
        alert("Please paste or type some text to analyze.");
        return;
      }
  
      const cleaned = cleanText(rawText);
      const lang = detectLanguage(cleaned);
      const summary = summarizeText(rawText);
      const keywords = extractKeywords(cleaned);
     
      if (!lang || lang === "Unknown 🌐") {
        languageResult.textContent = "Unable to detect language.";
      } else {
        languageResult.textContent = lang;
      }
    
      if (!summary || summary.trim() === "" || summary.includes("Summary not available")) {
        summaryResult.textContent = "Summary not available due to invalid or unrecognized text.";
      } else {
        summaryResult.textContent = summary + " (Top Keywords: " + keywords + ")";
      }
    
      resultStats.style.display = "block";
    });
  });