// ✅ Set the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

document.getElementById("pdfInput").addEventListener("change", async function (e) {
  const file = e.target.files[0];
  const output = document.getElementById("output");
  output.innerHTML = "";

  if (!file || file.type !== "application/pdf") {
    output.innerHTML = "<p class='text-danger'>Please upload a valid PDF file.</p>";
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const scale = 2;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;

      const wrapper = document.createElement("div");
      wrapper.className = "mb-4 text-center";

      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      img.className = "preview-img mb-2";

      const btnGroup = document.createElement("div");
      btnGroup.className = "d-flex justify-content-center gap-2";

      const downloadBtn = document.createElement("a");
      downloadBtn.href = img.src;
      downloadBtn.download = `page-${i}.png`;
      downloadBtn.className = "btn btn-success btn-sm";
      downloadBtn.textContent = `⬇️ Download Page ${i}`;

      const removeBtn = document.createElement("button");
      removeBtn.className = "btn btn-outline-danger btn-sm";
      removeBtn.textContent = "❌ Remove";
      removeBtn.onclick = () => wrapper.remove();

      btnGroup.appendChild(downloadBtn);
      btnGroup.appendChild(removeBtn);

      wrapper.appendChild(img);
      wrapper.appendChild(btnGroup);

      output.appendChild(wrapper);
    }
  } catch (error) {
    console.error("PDF parsing failed:", error);
    output.innerHTML = "<p class='text-danger'>⚠️ Failed to process PDF. Try a different file.</p>";
  }
});