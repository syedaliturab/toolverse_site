document.getElementById("convertCaseBtn").addEventListener("click", () => {
    let input = document.getElementById("inputText").value;
    const output = document.getElementById("outputText");
    const caseType = document.getElementById("caseType").value;
    const trimSpaces = document.getElementById("trimSpaces").checked;
    const preserveSpaces = document.getElementById("preserveMultipleSpaces").checked;
  
    if (trimSpaces) input = input.trim();
    if (!preserveSpaces) input = input.replace(/\s+/g, ' ');
  
    let result = '';
  
    switch (caseType) {
      case 'uppercase':
        result = input.toUpperCase();
        break;
      case 'lowercase':
        result = input.toLowerCase();
        break;
      case 'titlecase':
        result = input.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
        break;
      case 'sentencecase':
        result = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
        break;
    }
  
    output.value = result;
  });