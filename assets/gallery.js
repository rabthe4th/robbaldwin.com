(function () {
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  let photos = [];
  let currentFilter = "all";
  let visible = [];
  let lightboxIndex = 0;

  function fmtDate(iso) {
    const d = new Date(iso);
    return `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function monthKey(iso) {
    const d = new Date(iso);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  function buildStats() {
    document.getElementById("stat-count").textContent = photos.length;
    const first = new Date(photos[0].date);
    const last = new Date(photos[photos.length - 1].date);
    document.getElementById("stat-span").textContent = first.getFullYear();
    document.getElementById("stat-latest").textContent = fmtDate(photos[photos.length - 1].date);
  }

  function buildFilters() {
    const seen = [];
    photos.forEach(p => { if (!seen.includes(p.label)) seen.push(p.label); });
    const bar = document.getElementById("filter-bar");
    if (seen.length <= 1) {
      bar.style.display = "none";
      return;
    }
    seen.forEach(label => {
      const btn = document.createElement("button");
      btn.className = "filter-chip";
      btn.dataset.filter = label;
      btn.textContent = label;
      bar.appendChild(btn);
    });
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-chip");
      if (!btn) return;
      currentFilter = btn.dataset.filter;
      [...bar.children].forEach(c => c.classList.toggle("active", c === btn));
      renderGallery();
    });
  }

  function renderGallery() {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";
    visible = currentFilter === "all" ? photos.slice() : photos.filter(p => p.label === currentFilter);

    let lastMonth = null;
    visible.forEach((p, i) => {
      const mk = monthKey(p.date);
      if (mk !== lastMonth) {
        const divider = document.createElement("div");
        divider.className = "month-divider";
        divider.textContent = mk;
        gallery.appendChild(divider);
        lastMonth = mk;
      }
      const fig = document.createElement("figure");
      fig.innerHTML = `
        <img src="images/thumb/${p.file}" loading="lazy" alt="${p.label} - ${fmtDate(p.date)}">
        <figcaption><span class="cat">${p.label}</span><span>${fmtDate(p.date)}</span></figcaption>
      `;
      fig.addEventListener("click", () => openLightbox(i));
      gallery.appendChild(fig);
    });
  }

  function openLightbox(index) {
    lightboxIndex = index;
    showLightboxImage();
    document.getElementById("lightbox").classList.add("open");
  }

  function showLightboxImage() {
    const p = visible[lightboxIndex];
    document.getElementById("lb-img").src = `images/full/${p.file}`;
    document.getElementById("lb-caption").textContent = `${p.label} — ${fmtDate(p.date)}`;
  }

  function closeLightbox() {
    document.getElementById("lightbox").classList.remove("open");
  }

  function navLightbox(delta) {
    lightboxIndex = (lightboxIndex + delta + visible.length) % visible.length;
    showLightboxImage();
  }

  document.getElementById("lb-close").addEventListener("click", closeLightbox);
  document.getElementById("lb-prev").addEventListener("click", () => navLightbox(-1));
  document.getElementById("lb-next").addEventListener("click", () => navLightbox(1));
  document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!document.getElementById("lightbox").classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navLightbox(-1);
    if (e.key === "ArrowRight") navLightbox(1);
  });

  fetch("manifest.json")
    .then(r => r.json())
    .then(data => {
      photos = data.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
      buildStats();
      buildFilters();
      renderGallery();
    })
    .catch(err => {
      document.getElementById("gallery").innerHTML =
        "<p style='color:#999'>Could not load photos (manifest.json). If you're viewing this file locally, try the live site instead.</p>";
      console.error(err);
    });
})();
