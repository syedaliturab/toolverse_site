document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("pdfInput");
    const splitBtn = document.getElementById("splitBtn");
    const rangeInput = document.getElementById("range");
    let selectedFile = null;
  
    input.addEventListener("change", (e) => {
      selectedFile = e.target.files[0];
      splitBtn.disabled = !selectedFile;
    });
  
    splitBtn.addEventListener("click", async () => {
      if (!selectedFile) return;
  
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();
  
      let pagesToExtract = [];
      const range = rangeInput.value.trim();
  
      if (range) {
        const parts = range.split(',');
        parts.forEach(part => {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= totalPages) pagesToExtract.push(i - 1);
            }
          } else {
            const pageNum = parseInt(part.trim(), 10);
            if (pageNum >= 1 && pageNum <= totalPages) pagesToExtract.push(pageNum - 1);
          }
        });
      } else {
        pagesToExtract = Array.from({ length: totalPages }, (_, i) => i);
      }
  
      for (const i of pagesToExtract) {
        const newPdf = await PDFLib.PDFDocument.create();
        const [page] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(page);
  
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
  
        const a = document.createElement("a");
        a.href = url;
        a.download = `page-${i + 1}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  });