document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("pdfInput");
    const compressBtn = document.getElementById("compressBtn");
    const downloadLink = document.getElementById("downloadLink");
    const status = document.getElementById("status");
    let originalFile = null;
  
    input.addEventListener("change", (e) => {
      originalFile = e.target.files[0];
      compressBtn.disabled = !originalFile;
      status.textContent = "";
      downloadLink.classList.add("d-none");
    });
  
    compressBtn.addEventListener("click", async () => {
      if (!originalFile) return;
  
      status.textContent = "Compressing, please wait...";
      downloadLink.classList.add("d-none");
  
      try {
        const arrayBuffer = await originalFile.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  
        const compressedPdf = await PDFLib.PDFDocument.create();
        const copiedPages = await compressedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
  
        copiedPages.forEach(page => compressedPdf.addPage(page));
  
        // Optional: remove metadata
        compressedPdf.setTitle("");
        compressedPdf.setAuthor("");
        compressedPdf.setSubject("");
        compressedPdf.setKeywords([]);
  
        const compressedBytes = await compressedPdf.save();
        const blob = new Blob([compressedBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
  
        downloadLink.href = url;
        downloadLink.classList.remove("d-none");
        status.textContent = "✅ Compression complete.";
      } catch (error) {
        console.error("Compression failed:", error);
        status.innerHTML = `<span class="text-danger">❌ Failed to process PDF. It may be encrypted, corrupted, or invalid.</span>`;
      }
    });
  });