const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const reverseBtn = document.getElementById("reverseBtn");

reverseBtn.addEventListener("click", () => {
  const lines = inputText.value.split(/\r?\n/);
  const type = document.querySelector("input[name='reverseType']:checked").value;

  let result;

  switch (type) {
    case "lines":
      result = lines.reverse().join("\n");
      break;
    case "words":
      result = lines.map(line => line.trim().split(/\s+/).reverse().join(" ")).join("\n");
      break;
    case "chars":
      result = lines.map(line => line.split("").reverse().join("")).join("\n");
      break;
    default:
      result = inputText.value;
  }

  outputText.value = result;
});