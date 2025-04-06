document.addEventListener("DOMContentLoaded", function () {
  const imageInput = document.getElementById("imageInput");
  const watermarkImageInput = document.getElementById("watermarkImageInput");
  const previewWrapper = document.querySelector(".preview-wrapper");
  const uploadedImage = document.getElementById("uploaded-image");
  const draggableText = document.getElementById("draggable-watermark");
  const draggableImage = document.getElementById("draggable-watermark-img");
  const watermarkTextInput = document.getElementById("watermarkText");
  const watermarkSizeSlider = document.getElementById("watermarkSize");
  const watermarkColorInput = document.getElementById("watermarkColor");
  const watermarkOpacitySlider = document.getElementById("watermarkOpacity");
  
  const sizeValue = document.getElementById("sizeValue");
  const downloadBtn = document.getElementById("downloadAllBtn");
  const resetBtn = document.getElementById("resetAllBtn");
  const controls = document.getElementById("controls");
  const uploadArea = document.getElementById("upload-area");

  let uploadedFile = null;

  function updateTextProperties() {
    document.getElementById("watermark-content").textContent = watermarkTextInput.value || "ToolVerses";
    draggableText.style.fontSize = watermarkSizeSlider.value + "px";
    draggableText.style.color = watermarkColorInput.value;
    draggableText.style.opacity = watermarkOpacitySlider.value;
    sizeValue.textContent = watermarkSizeSlider.value;
  }

  function makeDraggable(el, container) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    el.addEventListener("mousedown", function (e) {
      isDragging = true;
      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      el.style.zIndex = 9999;
      e.preventDefault();
    });

    document.addEventListener("mousemove", function (e) {
      if (!isDragging) return;

      const containerRect = container.getBoundingClientRect();
      const elWidth = el.offsetWidth;
      const elHeight = el.offsetHeight;

      let newLeft = e.clientX - containerRect.left - offsetX;
      let newTop = e.clientY - containerRect.top - offsetY;

      newLeft = Math.max(0, Math.min(containerRect.width - elWidth, newLeft));
      newTop = Math.max(0, Math.min(containerRect.height - elHeight, newTop));

      el.style.left = `${newLeft}px`;
      el.style.top = `${newTop}px`;
    });

    document.addEventListener("mouseup", function () {
      isDragging = false;
      el.style.zIndex = 1;
    });
  }

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      uploadedImage.src = e.target.result;
      uploadedFile = file;
      previewWrapper.style.display = "inline-block";
      controls.style.display = "block";
      updateTextProperties();
    };
    reader.readAsDataURL(file);
  }

  function handleWatermarkImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      draggableImage.src = e.target.result;
      draggableImage.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  imageInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  watermarkImageInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleWatermarkImage(e.target.files[0]);
    }
  });

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
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  });

  resetBtn.addEventListener("click", () => {
    uploadedImage.src = "";
    imageInput.value = "";
    draggableImage.src = "";
    draggableImage.style.display = "none";
    previewWrapper.style.display = "none";
    controls.style.display = "none";
  });

  downloadBtn.addEventListener("click", () => {
    if (!uploadedImage.src) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = uploadedImage.naturalWidth;
    canvas.height = uploadedImage.naturalHeight;
    ctx.drawImage(uploadedImage, 0, 0);

    const scaleX = canvas.width / uploadedImage.clientWidth;
    const scaleY = canvas.height / uploadedImage.clientHeight;

    // Text Watermark
    const x = draggableText.offsetLeft * scaleX;
    const y = draggableText.offsetTop * scaleY;
    const fontSize = parseInt(watermarkSizeSlider.value) * scaleX;
    const text = document.getElementById("watermark-content").textContent;
    const color = watermarkColorInput.value;
    const opacity = parseFloat(watermarkOpacitySlider.value);
    ctx.globalAlpha = opacity;

    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    // Image Watermark
    if (draggableImage.src && draggableImage.style.display !== "none") {
      const img = new Image();
      img.onload = function () {
        const imgX = draggableImage.offsetLeft * scaleX;
        const imgY = draggableImage.offsetTop * scaleY;
        const imgW = draggableImage.offsetWidth * scaleX;
        const imgH = draggableImage.offsetHeight * scaleY;
        ctx.drawImage(img, imgX, imgY, imgW, imgH);

        canvas.toBlob(blob => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "watermarked_image.png";
          link.click();
        }, "image/png");
      };
      img.src = draggableImage.src;
    } else {
      canvas.toBlob(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "watermarked_image.png";
        link.click();
      }, "image/png");
    }
  });

  watermarkTextInput.addEventListener("input", updateTextProperties);
  watermarkSizeSlider.addEventListener("input", updateTextProperties);
  watermarkColorInput.addEventListener("input", updateTextProperties);
  watermarkOpacitySlider.addEventListener("input", updateTextProperties);


  makeDraggable(draggableText, uploadedImage);
  makeDraggable(draggableImage, uploadedImage);
});