document.addEventListener("DOMContentLoaded", function () {
    const tools = [
      {
        icon: "🔗",
        title: "Merge PDFs",
        desc: "Combine multiple PDF files into one.",
        href:"merge-pdf.html"
      },
      {
        icon: "✂️",
        title: "Split PDF",
        desc: "Extract specific pages from a PDF.",
        href: "split-pdf.html"
      },
      {
        icon: "📷",
        title: "PDF to Images",
        desc: "Convert PDF pages to JPG or PNG images.",
        href: "pdf-to-image.html"
      },
      {
        icon: "📥",
        title: "Compress PDF",
        desc: "Reduce PDF file size while keeping quality.",
        href: "compress-pdf.html"
      },
      {
        icon: "📝",
        title: "Edit PDF",
        desc: "Add text, annotations or signatures to your PDF.",
        href: "edit-pdf.html"
      },
      {
        icon: "✍️",
        title: "eSign PDF",
        desc: "Digitally sign PDFs with your mouse, text, or image signature.",
        href: "esign-pdf.html"
      }
    ];
  
    const container = document.getElementById("toolCardsContainer");
  
    tools.forEach(tool => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";
  
      col.innerHTML = `
        <a href="${tool.href}" class="text-decoration-none">
          <div class="card border-0 rounded-4 p-4 shadow-sm text-center bg-white hover-effect h-100">
            <div class="mb-2" style="font-size: 2rem;">${tool.icon}</div>
            <h6 class="fw-semibold mb-1">${tool.title}</h6>
            <p class="text-muted small mb-0">${tool.desc}</p>
          </div>
        </a>
      `;
      container.appendChild(col);
    });
  });