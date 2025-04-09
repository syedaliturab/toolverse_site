pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const pdfInput = document.getElementById("pdfInput");
const canvasContainer = document.getElementById("canvasContainer");
const drawTool = document.getElementById("drawTool");
const textTool = document.getElementById("textTool");
const imageTool = document.getElementById("imageTool");
const imageInput = document.getElementById("imageInput");
const textInput = document.getElementById("textInput");
const textSizeInput = document.getElementById("textSize");
const downloadBtn = document.getElementById("downloadBtn");

let currentTool = null;
let canvasList = [];

pdfInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || file.type !== "application/pdf") return;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  canvasContainer.innerHTML = "";
  canvasList = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    canvas.style.border = "1px solid #ccc";

    await page.render({ canvasContext: context, viewport }).promise;

    const drawCanvas = document.createElement("canvas");
    drawCanvas.width = canvas.width;
    drawCanvas.height = canvas.height;
    drawCanvas.classList.add("position-absolute");
    drawCanvas.style.top = "0";
    drawCanvas.style.left = "0";
    drawCanvas.style.zIndex = "10";
    drawCanvas.style.pointerEvents = "auto";

    let isDrawing = false;
    const ctx = drawCanvas.getContext("2d");
    ctx.strokeStyle = document.getElementById("penColor").value;
    ctx.lineWidth = 2;

    drawCanvas.addEventListener("mousedown", (e) => {
      if (currentTool !== "draw") return;
      ctx.strokeStyle = document.getElementById("penColor").value;
      isDrawing = true;
      const rect = drawCanvas.getBoundingClientRect();
      const scaleX = drawCanvas.width / rect.width;
      const scaleY = drawCanvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      ctx.beginPath();
      ctx.moveTo(x, y);
    });

    drawCanvas.addEventListener("mousemove", (e) => {
      if (!isDrawing || currentTool !== "draw") return;
      const rect = drawCanvas.getBoundingClientRect();
      const scaleX = drawCanvas.width / rect.width;
      const scaleY = drawCanvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    drawCanvas.addEventListener("mouseup", () => {
      isDrawing = false;
    });

    const wrapper = document.createElement("div");
    wrapper.className = "position-relative mb-4";
    wrapper.style.width = "100%";
    wrapper.style.maxWidth = "100%";
    wrapper.appendChild(canvas);
    wrapper.appendChild(drawCanvas);

    canvasContainer.appendChild(wrapper);
    canvas.drawOverlay = drawCanvas;
    canvasList.push(canvas);
  }
});

// TOOL ACTIONS
drawTool.onclick = () => {
  currentTool = "draw";
  textInput.style.display = "none";
  textSizeInput.style.display = "none";
  canvasContainer.style.cursor = "url('../../assets/images/pencil.cur'), auto";
};

textTool.onclick = () => {
  currentTool = "text";
  textInput.style.display = "inline-block";
  textSizeInput.style.display = "inline-block";
  canvasContainer.style.cursor = "text";
};

imageTool.onclick = () => imageInput.click();

// TEXT INSERTION
canvasContainer.addEventListener("click", (e) => {
  if (currentTool === "text" && textInput.value.trim()) {
    const canvas = e.target;
    if (!canvas.getContext) return;

    const ctx = canvas.getContext("2d");
    const fontSize = textSizeInput.value || 16;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "#000";

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.fillText(textInput.value, x, y);
  }
});

// IMAGE INSERTION
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasList[0];
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 20, 20, 100, 100); // top-left watermark
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// DOWNLOAD EDITED PDF
downloadBtn.onclick = async () => {
  const pdfDoc = await PDFLib.PDFDocument.create();

  for (const baseCanvas of canvasList) {
    const canvas = document.createElement("canvas");
    canvas.width = baseCanvas.width;
    canvas.height = baseCanvas.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(baseCanvas, 0, 0);

    if (baseCanvas.drawOverlay) {
      ctx.drawImage(baseCanvas.drawOverlay, 0, 0);
    }

    const imgData = canvas.toDataURL("image/png");
    const page = pdfDoc.addPage([canvas.width, canvas.height]);
    const pngImage = await pdfDoc.embedPng(imgData);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "edited.pdf";
  link.click();
};