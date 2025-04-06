document.addEventListener("DOMContentLoaded", function () {
    const uploadArea = document.getElementById("upload-area");
    let imageInput = document.getElementById("imageInput");
    const previewContainer = document.getElementById("preview-container");
    const resetAllBtn = document.getElementById("resetAllBtn");
    const downloadAllBtn = document.getElementById("downloadAllBtn");
  
    let convertedFiles = [];
  
    function updateButtonsVisibility() {
      const hasFiles = convertedFiles.length > 0;
      resetAllBtn.style.display = hasFiles ? "inline-block" : "none";
      downloadAllBtn.style.display = hasFiles ? "inline-block" : "none";
    }
  
    function resetInputIfEmpty() {
        if (convertedFiles.length === 0) {
          const newInput = imageInput.cloneNode(true);
          newInput.value = "";
          imageInput.parentNode.replaceChild(newInput, imageInput);
          imageInput = newInput;
          imageInput.addEventListener("change", (e) => {
            handleFiles(e.target.files);
          });
        }
      }
    function createPreview(jpgDataUrl, fileName) {
      const col = document.createElement("div");
      col.className = "col-md-4 preview-box text-center";
  
      const img = document.createElement("img");
      img.src = jpgDataUrl;
      img.alt = "Preview";
      img.className = "img-fluid rounded shadow";
  
      const jpgName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
  
      const downloadLink = document.createElement("a");
      downloadLink.href = jpgDataUrl;
      downloadLink.download = jpgName;
      downloadLink.className = "btn btn-sm btn-success mt-2 me-2";
      downloadLink.textContent = "⬇️ Download";
  
      const removeBtn = document.createElement("button");
      removeBtn.className = "btn btn-sm btn-outline-danger mt-2";
      removeBtn.textContent = "❌ Remove";
  
      removeBtn.onclick = () => {
        col.remove();
      
        convertedFiles = convertedFiles.filter(f => f.name !== jpgName); // or watermarkName
        updateButtonsVisibility();
        imageInput.value = "";
        // ✅ Reset input if no previews remain
        resetInputIfEmpty();
      };
  
      fetch(jpgDataUrl)
        .then(res => res.blob())
        .then(blob => {
          convertedFiles.push({ blob, name: jpgName });
          updateButtonsVisibility();
        });
  
      col.appendChild(img);
      col.appendChild(downloadLink);
      col.appendChild(removeBtn);
      previewContainer.appendChild(col);
    }
  
    function convertAndPreview(file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.95);
          createPreview(jpgDataUrl, file.name);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  
    function handleFiles(files) {
      [...files].forEach(file => {
        if (file.type.startsWith("image/")) {
          convertAndPreview(file);
        }
      });
    }
  
    imageInput.addEventListener("change", (e) => {
      handleFiles(e.target.files);
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
      handleFiles(e.dataTransfer.files);
    });
  
    resetAllBtn.addEventListener("click", () => {
      previewContainer.innerHTML = "";
      convertedFiles = [];
  
      const newInput = imageInput.cloneNode(true);
      newInput.value = "";
      imageInput.parentNode.replaceChild(newInput, imageInput);
      imageInput = newInput;
  
      imageInput.addEventListener("change", (e) => {
        handleFiles(e.target.files);
      });
  
      updateButtonsVisibility();
    });
  
    downloadAllBtn.addEventListener("click", async () => {
      if (convertedFiles.length === 0) return;
  
      const zip = new JSZip();
      convertedFiles.forEach(file => {
        zip.file(file.name, file.blob);
      });
  
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "converted_images.zip";
      link.click();
    });
  });