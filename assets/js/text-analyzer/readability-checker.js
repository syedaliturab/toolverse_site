// ../../assets/js/text-analyzer/readability-checker.js

document.addEventListener("DOMContentLoaded", function () {
    const inputText = document.getElementById("inputText");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const resultStats = document.getElementById("resultStats");
  
    const wordCount = document.getElementById("wordCount");
    const sentenceCount = document.getElementById("sentenceCount");
    const syllableCount = document.getElementById("syllableCount");
    const readabilityScore = document.getElementById("readabilityScore");
  
    function countWords(text) {
      const words = text.trim().match(/\b\w+\b/g) || [];
      return words.length;
    }
  
    function countSentences(text) {
      const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim() !== '');
      return sentences.length;
    }
  
    function countSyllables(word) {
      word = word.toLowerCase().replace(/[^a-z]/g, '');
  
      if (!word.length) return 0;
  
      const exceptionAdd = ['serious', 'crucial', 'poet', 'create', 'science', 'quiet', 'diet', 'trial', 'riot', 'various'];
      const exceptionDel = ['fortunately', 'unfortunately', 'probably', 'family'];
  
      const coTwo = ['coapt', 'coed', 'coinci'];
      const preTwo = ['preach', 'preem', 'preexist'];
  
      const suffixes = ['ion', 'ious', 'uous', 'eous', 'science', 'tion'];
  
      let syl = 0;
      const vowels = 'aeiouy';
      let wasPrevVowel = false;
  
      for (let i = 0; i < word.length; i++) {
        const isVowel = vowels.indexOf(word[i]) !== -1;
  
        if (isVowel && !wasPrevVowel) {
          syl++;
        }
        wasPrevVowel = isVowel;
      }
  
      // Silent e rule
      if (word.endsWith('e')) {
        if (!(word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3]))) {
          syl--;
        }
      }
  
      // Consonant + le endings
      if (word.length > 2 && word.endsWith('le') && !vowels.includes(word[word.length - 3])) {
        syl++;
      }
  
      // Diphthong corrections
      if (word.includes('ia') || word.includes('io') || word.includes('ua') || word.includes('uo')) {
        syl++;
      }
  
      // co- and pre- special prefixes
      if (word.startsWith('co') && coTwo.some(prefix => word.startsWith(prefix))) {
        syl++;
      }
  
      if (word.startsWith('pre') && preTwo.some(prefix => word.startsWith(prefix))) {
        syl++;
      }
  
      // Ending Y
      if (word.endsWith('y') && word.length > 1 && !vowels.includes(word[word.length - 2])) {
        syl++;
      }
  
      // Complex suffixes
      suffixes.forEach(suffix => {
        if (word.endsWith(suffix)) {
          syl++;
        }
      });
  
      // Exceptions add or remove
      if (exceptionAdd.includes(word)) syl++;
      if (exceptionDel.includes(word)) syl--;
  
      // Minimum 1 syllable
      syl = Math.max(1, syl);
  
      return syl;
    }
  
    function totalSyllables(text) {
      const words = text.trim().match(/\b\w+\b/g) || [];
      let syllableTotal = 0;
      words.forEach(word => {
        syllableTotal += countSyllables(word);
      });
      return syllableTotal;
    }
  
    function calculateFleschKincaid(words, sentences, syllables) {
      if (words === 0 || sentences === 0) return 0;
      const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
      return Math.max(0, Math.min(100, score.toFixed(2))); // clamp between 0-100
    }
  
    analyzeBtn.addEventListener("click", function () {
      const text = inputText.value.trim();
  
      if (text === "") {
        alert("Please paste or type some text to analyze.");
        return;
      }
  
      const words = countWords(text);
      const sentences = countSentences(text);
      const syllables = totalSyllables(text);
      const score = calculateFleschKincaid(words, sentences, syllables);
  
      wordCount.textContent = words;
      sentenceCount.textContent = sentences;
      syllableCount.textContent = syllables;
      readabilityScore.textContent = score;
  
      resultStats.style.display = "block";
    });
  });