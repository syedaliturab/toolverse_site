document.addEventListener("DOMContentLoaded", function () {
  const imageInput = document.getElementById("imageInput");
  const previewImage = document.getElementById("preview-image");
  const previewContainer = document.getElementById("preview-container");
  const removeBtn = document.getElementById("removeBtn");

  const sliders = {
    grayscale: document.getElementById("grayscale"),
    sepia: document.getElementById("sepia"),
    blur: document.getElementById("blur"),
    contrast: document.getElementById("contrast"),
    hue: document.getElementById("hue"),
    saturation: document.getElementById("saturation"),
  };

  let originalImageType = 'image/png'; // Default type is PNG

  function resetFilters() {
    Object.values(sliders).forEach(slider => {
      slider.value = slider.defaultValue; // Reset each slider to its default value
    });
    applyFilters(); // Apply filters after resetting
  }

  function applyFilters() {
    const filterString = `
      grayscale(${sliders.grayscale.value}%)
      sepia(${sliders.sepia.value}%)
      blur(${sliders.blur.value}px)
      contrast(${sliders.contrast.value}%)
      hue-rotate(${sliders.hue.value}deg)
      saturate(${sliders.saturation.value}%)
    `.trim();
    previewImage.style.filter = filterString;
  }

  Object.values(sliders).forEach(slider => {
    slider.addEventListener("input", applyFilters);
  });

  imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      previewContainer.style.display = "block";
      resetFilters(); // Reset filters whenever a new image is uploaded

      // Set the original image type based on file type
      originalImageType = file.type;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("downloadBtn").addEventListener("click", function () {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.filter = previewImage.style.filter;
      ctx.drawImage(img, 0, 0);

      // Download image in its original format, ensuring JPG uses the .jpg extension
      const fileExtension = originalImageType === 'image/jpeg' ? 'jpg' : originalImageType.split('/')[1];
      canvas.toBlob(function (blob) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `filtered_image.${fileExtension}`; // Use .jpg for jpeg images
        link.click();
      }, originalImageType);
    };
    img.src = previewImage.src;
  });

  removeBtn.addEventListener("click", function () {
    previewImage.src = "";
    previewContainer.style.display = "none";
    imageInput.value = "";
    resetFilters(); // Reset filters when the "Remove" button is clicked
  });
});