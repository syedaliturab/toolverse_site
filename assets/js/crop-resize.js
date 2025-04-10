document.addEventListener("DOMContentLoaded", function () {
  const dpi = 96;
  let unit = "px";
  let currentImage = null;
  let cropper = null;
  let originalMimeType = 'image/jpeg';  // Default to JPEG

  const imageInput = document.getElementById("imageInput");
  const togglePx = document.getElementById("togglePx");
  const toggleCm = document.getElementById("toggleCm");
  const unitLabelW = document.getElementById("unitLabelW");
  const unitLabelH = document.getElementById("unitLabelH");
  const widthInput = document.getElementById("widthInput");
  const heightInput = document.getElementById("heightInput");
  const resizeBtn = document.getElementById("resizeBtn");
  const cropBtn = document.getElementById("cropBtn");
  const previewImg = document.getElementById("previewImg");
  const canvas = document.getElementById("canvas");
  const downloadBtn = document.getElementById("downloadBtn");
  const resetBtn = document.getElementById("resetBtn");
  const downloadSection = document.getElementById("downloadSection");

  const resizeSection = document.getElementById("resize-section");
  const cropSection = document.getElementById("crop-section");
  const showResize = document.getElementById("showResize");
  const showCrop = document.getElementById("showCrop");

  // Aspect Ratio Dropdown
  const aspectRatioWrapper = document.createElement("div");
  aspectRatioWrapper.classList.add("d-flex", "flex-column", "align-items-center", "mb-3");
  aspectRatioWrapper.innerHTML = `
    <label for="aspectRatioSelect" class="form-label fw-semibold">Aspect Ratio</label>
    <select id="aspectRatioSelect" class="form-select w-auto">
      <option value="NaN">Free</option>
      <option value="1">1:1</option>
      <option value="16/9">16:9</option>
      <option value="4/3">4:3</option>
      <option value="3/2">3:2</option>
      <option value="9/16">9:16</option>
    </select>
  `;
  cropSection.insertBefore(aspectRatioWrapper, cropBtn);
  const aspectRatioSelect = document.getElementById("aspectRatioSelect");

  showResize.addEventListener("click", () => {
    cropSection.classList.remove("active-tool");
    resizeSection.classList.add("active-tool");
    destroyCropper();
  });

  showCrop.addEventListener("click", () => {
    resizeSection.classList.remove("active-tool");
    cropSection.classList.add("active-tool");
    if (previewImg.src && !cropper) {
      cropper = new Cropper(previewImg, {
        viewMode: 1,
        autoCropArea: 1,
        aspectRatio: eval(aspectRatioSelect.value) || NaN
      });
    }
  });

  aspectRatioSelect.addEventListener("change", () => {
    if (cropper) {
      cropper.setAspectRatio(eval(aspectRatioSelect.value) || NaN);
    }
  });

  togglePx.addEventListener("click", () => {
    if (unit !== "px") {
      convertInputs(unit, "px");
      unit = "px";
      setActiveUnit("px");
      unitLabelW.textContent = "Width (px)";
      unitLabelH.textContent = "Height (px)";
    }
  });

  toggleCm.addEventListener("click", () => {
    if (unit !== "cm") {
      convertInputs(unit, "cm");
      unit = "cm";
      setActiveUnit("cm");
      unitLabelW.textContent = "Width (cm)";
      unitLabelH.textContent = "Height (cm)";
    }
  });

  function setActiveUnit(selected) {
    togglePx.classList.toggle("btn-primary", selected === "px");
    togglePx.classList.toggle("btn-outline-primary", selected !== "px");
    toggleCm.classList.toggle("btn-primary", selected === "cm");
    toggleCm.classList.toggle("btn-outline-secondary", selected !== "cm");
  }

  function convertInputs(from, to) {
    let width = parseFloat(widthInput.value);
    let height = parseFloat(heightInput.value);
    if (isNaN(width) || isNaN(height)) return;

    if (from === "px" && to === "cm") {
      width = (width / dpi) * 2.54;
      height = (height / dpi) * 2.54;
    } else if (from === "cm" && to === "px") {
      width = (width * dpi) / 2.54;
      height = (height * dpi) / 2.54;
    }
    widthInput.value = Math.round(width);
    heightInput.value = Math.round(height);
  }

  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          let w = img.width;
          let h = img.height;
          if (unit === "cm") {
            w = Math.round((w / dpi) * 2.54);
            h = Math.round((h / dpi) * 2.54);
          }
          widthInput.value = w;
          heightInput.value = h;
          previewImg.src = e.target.result;
          previewImg.style.display = "block";
          destroyCropper();

          // Set the original mime type for the image
          originalMimeType = file.type;

          // Auto-resize on load
          let drawW = unit === "cm" ? (w * dpi) / 2.54 : w;
          let drawH = unit === "cm" ? (h * dpi) / 2.54 : h;

          canvas.width = Math.round(drawW);
          canvas.height = Math.round(drawH);
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const dataURL = canvas.toDataURL(originalMimeType, 1.0); // Using the original mime type
          previewImg.src = dataURL;
          previewImg.style.display = "block";
          currentImage = new Image();
          currentImage.src = dataURL;

          resizeSection.classList.add("active-tool");
          cropSection.classList.remove("active-tool");
          downloadSection.style.display = "block";
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  resizeBtn.addEventListener("click", function () {
    if (!currentImage) return;
    destroyCropper();

    let width = parseFloat(widthInput.value);
    let height = parseFloat(heightInput.value);

    if (unit === "cm") {
      width = (width * dpi) / 2.54;
      height = (height * dpi) / 2.54;
    }

    if (isNaN(width) || isNaN(height) || width < 1 || height < 1) {
      alert("Invalid dimensions.");
      return;
    }

    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL(originalMimeType, 1.0); // Using the original mime type
    previewImg.src = dataURL;
    previewImg.style.display = "block";
    currentImage = new Image();
    currentImage.src = dataURL;

    downloadSection.style.display = "block";
  });

  cropBtn.addEventListener("click", () => {
    if (!cropper) return;
    const canvasData = cropper.getCroppedCanvas();
    if (!canvasData) return;
    const dataURL = canvasData.toDataURL(originalMimeType, 1.0); // Using the original mime type
    previewImg.src = dataURL;
    previewImg.style.display = "block";

    const newImg = new Image();
    newImg.onload = () => {
      currentImage = newImg;
    };
    newImg.src = dataURL;

    downloadSection.style.display = "block";
    destroyCropper();

    // Switch back to resize mode after crop
    resizeSection.classList.add("active-tool");
    cropSection.classList.remove("active-tool");
  });

  function destroyCropper() {
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
  }

  downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `image.${originalMimeType === "image/png" ? "png" : "jpg"}`; // Use the correct extension based on mime type
    link.href = previewImg.src;
    link.click();
  });

  resetBtn.addEventListener("click", () => {
    previewImg.src = "";
    previewImg.style.display = "none";
    imageInput.value = "";
    widthInput.value = "";
    heightInput.value = "";
    downloadSection.style.display = "none";
    destroyCropper();
    currentImage = null;
    resizeSection.classList.remove("active-tool");
    cropSection.classList.remove("active-tool");
    document.getElementById("aspectRatioSelect").value = "NaN";
  });
});