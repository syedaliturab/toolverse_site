document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("pdfInput");
  const mergeBtn = document.getElementById("mergeBtn");
  const fileList = document.getElementById("fileList");

  let pdfFiles = [];

  input.addEventListener("change", (e) => {
    const newFiles = Array.from(e.target.files);
    newFiles.forEach(file => {
      if (!pdfFiles.some(f => f.name === file.name && f.size === file.size)) {
        pdfFiles.push(file);
      }
    });
    updateFileList();
    mergeBtn.disabled = pdfFiles.length < 2;
    input.value = '';
  });

  function updateFileList() {
    fileList.innerHTML = "";
    pdfFiles.forEach((file, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "d-flex justify-content-between align-items-center border rounded px-3 py-2 mb-2 bg-light";

      const label = document.createElement("div");
      label.textContent = `${index + 1}. ${file.name} — ${Math.round(file.size / 1024)} KB`;

      const removeBtn = document.createElement("button");
      removeBtn.className = "btn btn-sm btn-outline-danger";
      removeBtn.innerHTML = "❌";
      removeBtn.onclick = () => {
        pdfFiles.splice(index, 1);
        updateFileList();
        mergeBtn.disabled = pdfFiles.length < 2;
      };

      wrapper.appendChild(label);
      wrapper.appendChild(removeBtn);
      fileList.appendChild(wrapper);
    });
  }

  mergeBtn.addEventListener("click", async () => {
    if (pdfFiles.length < 2) return;

    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const file of pdfFiles) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const finalPdf = await mergedPdf.save();
    const blob = new Blob([finalPdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "merged.pdf";
    link.click();
    URL.revokeObjectURL(url);
  });
});