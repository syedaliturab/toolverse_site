document.addEventListener("DOMContentLoaded", function () {
  const photoSizeSelect = document.getElementById("photoSizeSelect");
  const imageInput = document.getElementById("imageInput");
  const previewContainer = document.getElementById("preview-container");
  const downloadAllBtn = document.getElementById("downloadAllBtn");
  const resetAllBtn = document.getElementById("resetAllBtn");

  const sizes = {
    india: { w: 413, h: 531 },
    us: { w: 600, h: 600 },
    uk: { w: 413, h: 531 },
    canada: { w: 591, h: 827 },
    china: { w: 390, h: 567 },
    schengen: { w: 413, h: 531 },
    postcard: { w: 1200, h: 1800 }
  };

  let originalFiles = [];
  let convertedFiles = [];

  function updateButtonsVisibility() {
    const hasFiles = convertedFiles.length > 0;
    downloadAllBtn.style.display = hasFiles ? "inline-block" : "none";
    resetAllBtn.style.display = hasFiles ? "inline-block" : "none";
  }

  function convertImage(file, format) {
    const { w, h } = sizes[format];
    const reader = new FileReader();

    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);

        const scale = Math.min(w / img.width, h / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (w - scaledWidth) / 2;
        const offsetY = (h - scaledHeight) / 2;

        ctx.drawImage(img, 0, 0, w, h);

        // Check the image format
        const fileType = file.type.split('/')[1]; // Extract "png" or "jpeg"

        // Set the mime type based on the file type (jpeg or png)
        const mimeType = fileType === "png" ? "image/png" : "image/jpeg";
        
        const dataURL = canvas.toDataURL(mimeType, 1.0);
        const fileName = file.name.replace(/\.[^/.]+$/, "") + "_" + format + "." + fileType;

        createPreview(fileName, dataURL, file.name, fileType); // Pass fileType to createPreview
      };
      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  }

  function createPreview(fileName, dataUrl, originalName, fileType) {
    const col = document.createElement("div");
    col.className = "col-md-4 preview-box text-center";

    const img = document.createElement("img");
    img.src = dataUrl;
    img.className = "img-fluid rounded shadow";
    img.alt = "Preview";

    const downloadLink = document.createElement("a");
    downloadLink.href = dataUrl;
    downloadLink.download = fileName;
    downloadLink.className = "btn btn-sm btn-success mt-2 me-2";
    downloadLink.textContent = "⬇️ Download";

    // Set the correct file extension based on file type
    downloadLink.download = `${fileName.split('.')[0]}.${fileType}`; // Correct download extension

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-sm btn-outline-danger mt-2";
    removeBtn.textContent = "❌ Remove";

    removeBtn.addEventListener("click", () => {
      col.remove();
      convertedFiles = convertedFiles.filter(f => f.name !== fileName);
      originalFiles = originalFiles.filter(f => f.name !== originalName);
      imageInput.value = ""; // always reset input on removal
      updateButtonsVisibility();
    });

    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        convertedFiles.push({ name: fileName, blob });
        updateButtonsVisibility();
      });

    col.appendChild(img);
    col.appendChild(downloadLink);
    col.appendChild(removeBtn);
    previewContainer.appendChild(col);
  }

  function handleFiles(files) {
    const format = photoSizeSelect.value;
    [...files].forEach(file => {
      if (file.type.startsWith("image/")) {
        originalFiles.push(file);
        convertImage(file, format);
      }
    });
  }

  function reprocessAllPreviews() {
    const currentScroll = window.scrollY;
    const format = photoSizeSelect.value;
  
    const newConvertedFiles = [];
  
    const updatePreview = (file, previewCard) => {
      const { w, h } = sizes[format];
      const reader = new FileReader();
  
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
  
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, w, h);
  
          const scale = Math.min(w / img.width, h / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const offsetX = (w - scaledWidth) / 2;
          const offsetY = (h - scaledHeight) / 2;
  
          ctx.drawImage(img, 0, 0, w, h);
  
          const fileType = file.type.split('/')[1]; // Check the original image type
          const dataURL = canvas.toDataURL(`image/${fileType}`, 1.0); // Set MIME type correctly
          const fileName = file.name.replace(/\.[^/.]+$/, "") + "_" + format + `.${fileType}`;
  
          // Update image and download button inside the card
          const imgEl = previewCard.querySelector("img");
          const downloadLink = previewCard.querySelector("a");
  
          imgEl.src = dataURL;
          imgEl.alt = fileName;
  
          downloadLink.href = dataURL;
          downloadLink.download = fileName;
  
          fetch(dataURL)
            .then(res => res.blob())
            .then(blob => {
              newConvertedFiles.push({ name: fileName, blob });
              convertedFiles = newConvertedFiles;
            });
        };
        img.src = event.target.result;
      };
  
      reader.readAsDataURL(file);
    };
  
    const previewCards = previewContainer.querySelectorAll(".preview-box");
  
    originalFiles.forEach((file, index) => {
      const card = previewCards[index];
      if (card) {
        updatePreview(file, card);
      }
    });
  
    // Restore scroll position after image loads
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScroll });
    });
  }

  imageInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
  });

  downloadAllBtn.addEventListener("click", async () => {
    if (!convertedFiles.length) return;

    const zip = new JSZip();
    const format = photoSizeSelect.value;

    convertedFiles.forEach(file => {
      zip.file(file.name, file.blob);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `converted_${format}_photos.zip`;
    link.click();
  });

  resetAllBtn.addEventListener("click", () => {
    previewContainer.innerHTML = "";
    originalFiles = [];
    convertedFiles = [];
    imageInput.value = "";
    updateButtonsVisibility();
  });

  // ✅ Just listen to change - no need to mess with mousedown
  photoSizeSelect.addEventListener("change", () => {
    reprocessAllPreviews();
  });
});