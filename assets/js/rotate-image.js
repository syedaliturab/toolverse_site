document.addEventListener("DOMContentLoaded", function () {
  let imageInput = document.getElementById("imageInput");
  const previewContainer = document.getElementById("preview-container");
  const downloadAllBtn = document.getElementById("downloadAllBtn");
  const resetAllBtn = document.getElementById("resetAllBtn");
  const rotateAllLeftBtn = document.getElementById("rotateLeftAllBtn");
  const rotateAllRightBtn = document.getElementById("rotateRightAllBtn");
  const removeAllBtn = document.getElementById("removeAllBtn"); // New button

  let rotatedFiles = new Map(); // key: filename, value: { blob, name, angle, img, mimeType }

  function updateButtonsVisibility() {
      const hasFiles = rotatedFiles.size > 0;
      const controls = [
          downloadAllBtn,
          resetAllBtn,
          rotateAllLeftBtn,
          rotateAllRightBtn,
          removeAllBtn
      ];
      controls.forEach(btn => {
          btn.style.display = hasFiles ? "inline-block" : "none";
      });
  }

  function drawRotatedImage(img, angle, mimeType, callback) {
      const radians = (angle * Math.PI) / 180;

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));
      const newWidth = img.width * cos + img.height * sin;
      const newHeight = img.width * sin + img.height * cos;

      tempCanvas.width = newWidth;
      tempCanvas.height = newHeight;

      tempCtx.translate(newWidth / 2, newHeight / 2);
      tempCtx.rotate(radians);
      tempCtx.drawImage(img, -img.width / 2, -img.height / 2);

      // Ensure the image format is preserved when saving
      tempCanvas.toBlob(function (blob) {
          callback(blob, tempCanvas.toDataURL(mimeType)); // Use the original MIME type for saving
      }, mimeType);  // Ensure we pass the correct MIME type when saving
  }

  function updatePreview(fileName, angle) {
      const entry = rotatedFiles.get(fileName);
      if (!entry) return;

      drawRotatedImage(entry.img, angle, entry.mimeType, (blob, dataUrl) => {
          const preview = document.querySelector(`[data-filename="${fileName}"]`);
          const imgEl = preview.querySelector("img");
          const downloadLink = preview.querySelector("a");

          imgEl.src = dataUrl;
          downloadLink.href = dataUrl;

          entry.blob = blob;
          entry.angle = angle;
      });
  }

  function resetInputIfEmpty() {
      if (rotatedFiles.size === 0) {
          const newInput = imageInput.cloneNode(true);
          newInput.value = "";
          imageInput.parentNode.replaceChild(newInput, imageInput);
          imageInput = newInput;
          imageInput.addEventListener("change", (e) => {
              handleFiles(e.target.files);
          });
      }
  }

  function createPreview(file, img, mimeType, angle = 0) {
      const rotatedName = file.name.replace(/\.[^/.]+$/, "") + "_rotated" + (mimeType === "image/png" ? ".png" : ".jpg");

      const col = document.createElement("div");
      col.className = "col-md-4 preview-box text-center";
      col.dataset.filename = file.name;

      const imageEl = document.createElement("img");
      imageEl.alt = "Preview";
      imageEl.className = "img-fluid rounded shadow";

      const downloadLink = document.createElement("a");
      downloadLink.className = "btn btn-sm btn-success mt-2 me-2";
      downloadLink.textContent = "⬇️ Download";

      const rotateLeft = document.createElement("button");
      rotateLeft.className = "btn btn-sm btn-outline-primary mt-2 me-2";
      rotateLeft.textContent = "↩️";
      rotateLeft.onclick = () => {
          let entry = rotatedFiles.get(file.name);
          let newAngle = (entry.angle - 90 + 360) % 360;
          updatePreview(file.name, newAngle);
      };

      const rotateRight = document.createElement("button");
      rotateRight.className = "btn btn-sm btn-outline-primary mt-2 me-2";
      rotateRight.textContent = "↪️";
      rotateRight.onclick = () => {
          let entry = rotatedFiles.get(file.name);
          let newAngle = (entry.angle + 90) % 360;
          updatePreview(file.name, newAngle);
      };

      const removeBtn = document.createElement("button");
      removeBtn.className = "btn btn-sm btn-outline-danger mt-2";
      removeBtn.textContent = "❌ Remove";
      removeBtn.onclick = () => {
          col.remove();
          rotatedFiles.delete(file.name);
          updateButtonsVisibility();

          const newInput = imageInput.cloneNode(true);
          newInput.value = "";
          imageInput.parentNode.replaceChild(newInput, imageInput);
          imageInput = newInput;
          imageInput.addEventListener("change", (e) => {
              handleFiles(e.target.files);
          });
      };

      col.appendChild(imageEl);
      col.appendChild(rotateLeft);
      col.appendChild(rotateRight);
      col.appendChild(downloadLink);
      col.appendChild(removeBtn);
      previewContainer.appendChild(col);

      drawRotatedImage(img, angle, mimeType, (blob, dataUrl) => {
          imageEl.src = dataUrl;
          downloadLink.href = dataUrl;
          downloadLink.download = rotatedName;

          rotatedFiles.set(file.name, {
              blob,
              name: rotatedName,
              angle,
              img,
              mimeType
          });

          updateButtonsVisibility();
      });
  }

  function handleFiles(files) {
      [...files].forEach(file => {
          if (!file.type.startsWith("image/")) return;

          const reader = new FileReader();
          reader.onload = function (event) {
              const img = new Image();
              img.onload = function () {
                  const mimeType = file.type;  // Store the original MIME type
                  createPreview(file, img, mimeType);
              };
              img.src = event.target.result;
          };
          reader.readAsDataURL(file);
      });
  }

  imageInput.addEventListener("change", (e) => {
      handleFiles(e.target.files);
  });

  downloadAllBtn.addEventListener("click", async () => {
      if (rotatedFiles.size === 0) return;

      const zip = new JSZip();
      rotatedFiles.forEach((file) => {
          zip.file(file.name, file.blob);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "rotated_images.zip";
      link.click();
  });

  resetAllBtn.addEventListener("click", () => {
      rotatedFiles.forEach((file, fileName) => {
          updatePreview(fileName, 0); // Reset to 0 angle
      });
  });

  removeAllBtn.addEventListener("click", () => {
      previewContainer.innerHTML = "";
      rotatedFiles.clear();

      const newInput = imageInput.cloneNode(true);
      newInput.value = "";
      imageInput.parentNode.replaceChild(newInput, imageInput);
      imageInput = newInput;

      imageInput.addEventListener("change", (e) => {
          handleFiles(e.target.files);
      });

      updateButtonsVisibility();
  });

  rotateAllLeftBtn.addEventListener("click", () => {
      rotatedFiles.forEach((file, fileName) => {
          let newAngle = (file.angle - 90 + 360) % 360;
          updatePreview(fileName, newAngle);
      });
  });

  rotateAllRightBtn.addEventListener("click", () => {
      rotatedFiles.forEach((file, fileName) => {
          let newAngle = (file.angle + 90) % 360;
          updatePreview(fileName, newAngle);
      });
  });
});