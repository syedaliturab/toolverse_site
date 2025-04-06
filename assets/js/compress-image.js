document.addEventListener("DOMContentLoaded", function () {
    const imageInput = document.getElementById("imageInput");
    const compressionSlider = document.getElementById("compressionSlider");
    const widthSlider = document.getElementById("widthSlider");
    const compressionValue = document.getElementById("compressionValue");
    const widthValue = document.getElementById("widthValue");
    const compressBtn = document.getElementById("compressBtn");
    const originalPreview = document.getElementById("originalPreview");
    const compressedPreview = document.getElementById("compressedPreview");
    const resultRow = document.getElementById("resultRow");
    const downloadBtn = document.getElementById("downloadBtn");
    const removeBtn = document.getElementById("removeBtn");
    const downloadContainer = document.getElementById("downloadContainer");
    const uploadBox = document.getElementById("upload-box");
  
    let originalImage = null;
    let compressedBlob = null;
  
    // Update sliders
    compressionSlider.addEventListener("input", () => {
      compressionValue.textContent = compressionSlider.value;
    });
  
    widthSlider.addEventListener("input", () => {
      widthValue.textContent = widthSlider.value;
    });
  
    // Handle image input
    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (event) {
          originalImage = new Image();
          originalImage.onload = () => {
            originalPreview.src = originalImage.src;
          
            // ✅ Show original image only
            resultRow.style.display = "flex";
            compressedPreview.src = ""; // Clear any previous compressed preview
            downloadContainer.style.display = "none";
          };
          originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  
    // Drag and drop
    uploadBox.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadBox.classList.add("dragover");
    });
  
    uploadBox.addEventListener("dragleave", () => {
      uploadBox.classList.remove("dragover");
    });
  
    uploadBox.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadBox.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        imageInput.files = e.dataTransfer.files;
        const event = new Event("change");
        imageInput.dispatchEvent(event);
      }
    });
  
    // Compress image
    compressBtn.addEventListener("click", () => {
      if (!originalImage) return;
  
      const canvas = document.createElement("canvas");
      const aspectRatio = originalImage.height / originalImage.width;
      const targetWidth = parseInt(widthSlider.value);
      const targetHeight = Math.round(targetWidth * aspectRatio);
      const quality = parseInt(compressionSlider.value) / 100;
  
      canvas.width = targetWidth;
      canvas.height = targetHeight;
  
      const ctx = canvas.getContext("2d");
      ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);
  
      canvas.toBlob(
        (blob) => {
          if (blob) {
            compressedBlob = blob;
            const compressedURL = URL.createObjectURL(blob);
            compressedPreview.onload = () => {
              compressedPreview.style.display = "block";
            };
            compressedPreview.onerror = () => {
              compressedPreview.style.display = "none";
            };
            compressedPreview.src = compressedURL;
            resultRow.style.display = "flex";
            downloadContainer.style.display = "block";
          }
        },
        "image/jpeg",
        quality
      );
    });
  
    // Download compressed
    downloadBtn.addEventListener("click", () => {
      if (!compressedBlob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(compressedBlob);
      link.download = "compressed_image.jpg";
      link.click();
    });
  
    // Remove everything
    removeBtn.addEventListener("click", () => {
      originalImage = null;
      compressedBlob = null;
      imageInput.value = "";
      originalPreview.src = "";
      compressedPreview.src = "";
      resultRow.style.display = "none";
      downloadContainer.style.display = "none";
    });
  });
  compressedPreview.onerror = () => {
    compressedPreview.style.display = "none";
    downloadContainer.style.display = "none";
  };