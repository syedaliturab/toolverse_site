document.addEventListener("DOMContentLoaded", function () {
  const uploadArea = document.getElementById("upload-area");
  const imageInput = document.getElementById("imageInput");
  const previewContainer = document.getElementById("preview-container");
  const resetAllBtn = document.getElementById("resetAllBtn");
  const downloadAllBtn = document.getElementById("downloadAllBtn");
  const formatSelect = document.getElementById("formatSelect");

  let convertedFiles = [];
  let originalFiles = [];

  function updateButtonsVisibility() {
    const hasFiles = convertedFiles.length > 0;
    resetAllBtn.style.display = hasFiles ? "inline-block" : "none";
    downloadAllBtn.style.display = hasFiles ? "inline-block" : "none";
  }

  function createPreview(fileName, dataUrl, originalName, blob) {
    const col = document.createElement("div");
    col.className = "col-md-4 preview-box text-center";

    const isPdf = fileName.endsWith(".pdf");

    const img = document.createElement("img");
    img.src = isPdf ? "../../assets/images/pdf-preview.svg" : dataUrl;
    img.alt = "Preview";
    img.className = "img-fluid rounded shadow";

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    downloadLink.className = "btn btn-sm btn-success mt-2 me-2";
    downloadLink.textContent = "⬇️ Download";

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-sm btn-outline-danger mt-2";
    removeBtn.textContent = "❌ Remove";

    removeBtn.onclick = () => {
      col.remove();
      convertedFiles = convertedFiles.filter(f => f.name !== fileName);
      originalFiles = originalFiles.filter(f => f.name !== originalName);
      imageInput.value = "";
      updateButtonsVisibility();
    };

    convertedFiles.push({ name: fileName, blob });

    col.appendChild(img);
    col.appendChild(downloadLink);
    col.appendChild(removeBtn);
    previewContainer.appendChild(col);
    updateButtonsVisibility();
  }

  async function convertToFormat(img, format, originalName) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    let blob, dataUrl, fileName;
    const baseName = originalName.replace(/\.[^/.]+$/, "");

    if (format === "pdf") {
      const pdf = new jspdf.jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height]
      });

      const imageData = canvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(imageData, "JPEG", 0, 0, img.width, img.height);
      blob = pdf.output("blob");
      dataUrl = URL.createObjectURL(blob);
      fileName = baseName + ".pdf";
    } else {
      const mimeType = format === "gif" ? "image/gif" : "image/png";
      dataUrl = canvas.toDataURL(mimeType, 1.0);
      blob = await (await fetch(dataUrl)).blob();
      fileName = baseName + "." + format;
    }

    return { fileName, dataUrl, blob };
  }

  async function convertAndPreview(file, format, previewCard = null) {
    const reader = new FileReader();
    reader.onload = async function (event) {
      const img = new Image();
      img.onload = async function () {
        const { fileName, dataUrl, blob } = await convertToFormat(img, format, file.name);

        if (previewCard) {
          // Refreshing preview without reloading whole card
          const imgEl = previewCard.querySelector("img");
          const linkEl = previewCard.querySelector("a");
          imgEl.src = fileName.endsWith(".pdf") ? "../../assets/images/pdf-preview.svg" : dataUrl;
          imgEl.alt = fileName;
          linkEl.href = URL.createObjectURL(blob);
          linkEl.download = fileName;
          convertedFiles.push({ name: fileName, blob });
        } else {
          createPreview(fileName, dataUrl, file.name, blob);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleFiles(files) {
    const format = formatSelect.value;
    [...files].forEach(file => {
      if (file.type.startsWith("image/")) {
        originalFiles.push(file);
        convertAndPreview(file, format);
      }
    });
  }

  function reprocessAllPreviews() {
    const format = formatSelect.value;
    const currentScroll = window.scrollY;
    const previewCards = previewContainer.querySelectorAll(".preview-box");

    convertedFiles = [];

    originalFiles.forEach((file, index) => {
      const card = previewCards[index];
      if (card) {
        convertAndPreview(file, format, card);
      }
    });

    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScroll });
    });
  }

  imageInput.addEventListener("change", (e) => handleFiles(e.target.files));

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });

  resetAllBtn.addEventListener("click", () => {
    previewContainer.innerHTML = "";
    convertedFiles = [];
    originalFiles = [];
    imageInput.value = "";
    updateButtonsVisibility();
  });

  downloadAllBtn.addEventListener("click", async () => {
    if (!convertedFiles.length) return;
    const zip = new JSZip();
    const format = formatSelect.value;
    convertedFiles.forEach(file => {
      zip.file(file.name, file.blob);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `converted_${format}_images.zip`;
    link.click();
  });

  formatSelect.addEventListener("change", () => {
    reprocessAllPreviews();
  });
});