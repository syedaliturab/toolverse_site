document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("collageInput");
    const canvas = document.getElementById("collageCanvas");
    const ctx = canvas.getContext("2d");
    const downloadBtn = document.getElementById("downloadCollage");
    const clearBtn = document.getElementById("clearCanvas");
  
    let imagesData = [];
    const maxPerRow = 4;
    const cellSize = 200;
    const spacing = 10;
  
    function redrawCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let x = 0, y = 0;
      imagesData.forEach((img, index) => {
        const row = Math.floor(index / maxPerRow);
        const col = index % maxPerRow;
        x = col * (cellSize + spacing);
        y = row * (cellSize + spacing);
        ctx.drawImage(img, x, y, cellSize, cellSize);
      });
    }
  
    input.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function (event) {
          const img = new Image();
          img.onload = function () {
            imagesData.push(img);
            redrawCanvas();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    });
  
    downloadBtn.addEventListener("click", () => {
      const link = document.createElement("a");
      canvas.toBlob((blob) => {
        link.href = URL.createObjectURL(blob);
        link.download = "collage.png";
        link.click();
      }, "image/png");
    });
  
    clearBtn.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      imagesData = [];
      input.value = "";
    });
  });