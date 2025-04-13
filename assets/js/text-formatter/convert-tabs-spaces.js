const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const convertBtn = document.getElementById("convertBtn");
const spaceCountInput = document.getElementById("spaceCount");
const toSpaces = document.getElementById("toSpaces");
const toTabs = document.getElementById("toTabs");

convertBtn.addEventListener("click", () => {
  const text = inputText.value;
  const spaces = parseInt(spaceCountInput.value, 10);
  const spaceString = " ".repeat(spaces);

  if (toSpaces.checked) {
    // Convert tabs to spaces
    outputText.value = text.replace(/\t/g, spaceString);
  } else if (toTabs.checked) {
    // Convert spaces to tabs (only leading spaces)
    const regex = new RegExp(`^(${spaceString})+`, "gm");
    outputText.value = text.replace(regex, (match) => "\t".repeat(match.length / spaces));
  }
});


function greet() {console.log("Hello, world!");
      console.log("This line uses 4 spaces.");
    if (true) {
      console.log("Indented with a tab.");
          console.log("Indented with 4 spaces.");
    }
  }