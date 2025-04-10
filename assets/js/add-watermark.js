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
  let originalMimeType = "image/png"; // default fallback

  // Track the original mime type
  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadedFile = file;
      originalMimeType = file.type; // track original type
    }
  });

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

      // Ensure the image is loaded before proceeding
      uploadedImage.onload = function () {
        controls.style.display = "block";  // Only show the controls once the image is fully loaded
      };
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
    // Ensure the uploaded image is fully loaded
    if (!uploadedImage.src || !uploadedImage.complete || uploadedImage.naturalWidth === 0) {
      alert("Image is not fully loaded yet. Please try again.");
      return;
    }
  
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
  
    // Create the download link
    const link = document.createElement("a");
  
    // Image Watermark (only if the image watermark exists and is visible)
    if (draggableImage.src && draggableImage.style.display !== "none" && draggableImage.style.display !== "" && draggableImage.style.display !== "") {
      const img = new Image();
      img.onload = function () {
        const imgX = draggableImage.offsetLeft * scaleX;
        const imgY = draggableImage.offsetTop * scaleY;
        const imgW = draggableImage.offsetWidth * scaleX;
        const imgH = draggableImage.offsetHeight * scaleY;
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
  
        canvas.toBlob(function(blob) {
          // Determine the extension based on MIME type
          const ext = originalMimeType === "image/png" ? "png" : (originalMimeType === "image/jpeg" ? "jpg" : "jpg");
          link.href = URL.createObjectURL(blob);
          link.download = `watermarked_image.${ext}`;  // Use correct extension
          link.click();
        }, originalMimeType);
      };
      img.src = draggableImage.src;  // Ensure watermark image is loaded before drawing
    } else {
      // No watermark image, just download the main image
      canvas.toBlob(function(blob) {
        // Default to JPG for non-PNG/JPEG images
        const ext = originalMimeType === "image/png" ? "png" : (originalMimeType === "image/jpeg" ? "jpg" : "jpg");
        link.href = URL.createObjectURL(blob);
        link.download = `watermarked_image.${ext}`;  // Use appropriate extension
        link.click();
      }, originalMimeType);
    }
  });

  watermarkTextInput.addEventListener("input", updateTextProperties);
  watermarkSizeSlider.addEventListener("input", updateTextProperties);
  watermarkColorInput.addEventListener("input", updateTextProperties);
  watermarkOpacitySlider.addEventListener("input", updateTextProperties);

  makeDraggable(draggableText, uploadedImage);
  makeDraggable(draggableImage, uploadedImage);
});