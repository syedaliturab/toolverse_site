pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

const pdfInput = document.getElementById("pdfInput");
const canvasContainer = document.getElementById("canvasContainer");
const signatureText = document.getElementById("signatureText");
const fontSelector = document.getElementById("fontSelector");
const addSignatureBtn = document.getElementById("addSignatureBtn");
const addDateBtn = document.getElementById("addDateBtn");
const downloadBtn = document.getElementById("downloadBtn");

let loadedPdf = null;

canvasContainer.style.position = "relative";
canvasContainer.style.maxHeight = "80vh";
canvasContainer.style.overflowY = "scroll";

// 🧠 Get the most visible canvas wrapper
function getMostVisibleCanvasWrapper() {
  const wrappers = document.querySelectorAll(".canvas-wrapper");
  let maxVisibleHeight = 0;
  let targetWrapper = wrappers[0];

  wrappers.forEach((wrapper) => {
    const rect = wrapper.getBoundingClientRect();
    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    if (visibleHeight > maxVisibleHeight) {
      maxVisibleHeight = visibleHeight;
      targetWrapper = wrapper;
    }
  });

  return targetWrapper;
}

// 🧾 Load PDF
pdfInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  loadedPdf = pdf;

  canvasContainer.innerHTML = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.2 });

    const canvasWrapper = document.createElement("div");
    canvasWrapper.classList.add("canvas-wrapper");
    canvasWrapper.style.position = "relative";
    canvasWrapper.style.marginBottom = "30px";

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");

    await page.render({ canvasContext: ctx, viewport }).promise;

    canvasWrapper.appendChild(canvas);
    canvasContainer.appendChild(canvasWrapper);
  }
});

// ✏️ Create draggable/resizable signature box
function createDraggableBox(text, fontFamily) {
  const box = document.createElement("div");
  box.className = "draggable-box";
  Object.assign(box.style, {
    position: "absolute",
    left: "100px",
    top: "100px",
    minWidth: "100px",
    minHeight: "40px",
    resize: "both",
    overflow: "hidden",
    border: "1px dashed #888",
    backgroundColor: "#fff",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
  });

  const span = document.createElement("span");
  span.innerText = text;
  span.style.fontFamily = fontFamily;
  span.style.fontSize = "24px";
  span.style.whiteSpace = "nowrap";
  span.style.pointerEvents = "none";
  span.style.userSelect = "none";
  box.appendChild(span);

  const closeBtn = document.createElement("div");
  closeBtn.innerHTML = "&times;";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "20px",
    height: "20px",
    backgroundColor: "#dc3545",
    color: "#fff",
    fontSize: "14px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 20,
    boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
  });
  closeBtn.onclick = () => box.remove();
  box.appendChild(closeBtn);

  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  box.addEventListener("mousedown", (e) => {
    if (e.target === closeBtn || e.offsetX > box.clientWidth - 20 && e.offsetY > box.clientHeight - 20) return;
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;

    document.onmousemove = (event) => {
      if (!isDragging) return;
      const parentRect = box.parentElement.getBoundingClientRect();
      box.style.left = `${event.clientX - parentRect.left - offsetX}px`;
      box.style.top = `${event.clientY - parentRect.top - offsetY}px`;
    };

    document.onmouseup = () => {
      isDragging = false;
      document.onmousemove = null;
    };
  });

  const updateFontSize = () => {
    const width = box.clientWidth;
    const height = box.clientHeight;
    const scaleFactor = Math.min(width / span.scrollWidth, height / 30);
    span.style.transform = `scale(${scaleFactor})`;
    span.style.transformOrigin = "center center";
  };

  new ResizeObserver(updateFontSize).observe(box);
  updateFontSize();

  fontSelector.addEventListener("change", () => {
    if (document.body.contains(box)) {
      span.style.fontFamily = fontSelector.value;
    }
  });

  // ✅ Append to the most visible canvas page
  const targetWrapper = getMostVisibleCanvasWrapper();
  targetWrapper.appendChild(box);
}

// 🖊️ Add Signature
addSignatureBtn.onclick = () => {
  if (!signatureText.value) return;
  createDraggableBox(signatureText.value, fontSelector.value);
};

// 🗓️ Add Date
addDateBtn.onclick = () => {
  const dateStr = new Date().toLocaleDateString();
  createDraggableBox(dateStr, fontSelector.value || "Arial");
};

// ⬇️ Download final PDF
downloadBtn.onclick = async () => {
  if (!loadedPdf) return;

  const pdfDoc = await PDFLib.PDFDocument.create();

  const wrappers = document.querySelectorAll(".canvas-wrapper");

  for (let wrapper of wrappers) {
    const canvas = wrapper.querySelector("canvas");
    const tempCanvas = canvas.cloneNode(true);
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(canvas, 0, 0);

    const boxes = wrapper.querySelectorAll(".draggable-box");
    boxes.forEach((box) => {
      const span = box.querySelector("span");
      const rect = box.getBoundingClientRect();
      const parentRect = wrapper.getBoundingClientRect();
      const x = rect.left - parentRect.left;
      const y = rect.top - parentRect.top;

      const scale = parseFloat(span.style.transform.match(/scale\((.*?)\)/)?.[1] || 1);
      const baseFontSize = parseInt(span.style.fontSize) || 24;
      const finalFontSize = baseFontSize * scale;

      tempCtx.font = `${finalFontSize}px ${span.style.fontFamily}`;
      tempCtx.fillStyle = "#000";

      const text = span.innerText.trim();
      const textWidth = tempCtx.measureText(text).width;
      const centerX = x + box.clientWidth / 2 - textWidth / 2;
      const centerY = y + box.clientHeight / 2 + finalFontSize / 2.8;

      tempCtx.fillText(text, centerX, centerY);
    });

    const imgData = tempCanvas.toDataURL("image/png");
    const embeddedImage = await pdfDoc.embedPng(imgData);
    const page = pdfDoc.addPage([canvas.width, canvas.height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    });
  }

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "signed.pdf";
  link.click();
};