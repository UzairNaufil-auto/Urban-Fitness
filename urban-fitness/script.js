const $ = (s, r = document) => r.querySelector(s);
const toggle = $(".nav-toggle"), menu = $("#menu");
toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", menu.classList.toggle("open")));
menu.addEventListener("click", e => { if (e.target.closest("a")) { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); } });
document.querySelectorAll("[data-plan]").forEach(b => b.addEventListener("click", () => { $("#plan-select").value = b.dataset.plan; }));

/* Demo form: validates, then keeps the request in this browser only (no backend yet) */
const form = $("#join"), result = $("#result");
const rules = {
  name: v => v.trim().length < 2 ? "Please enter your full name." : "",
  phone: v => v.replace(/\D/g, "").length < 7 ? "Please enter a valid phone number." : ""
};
form.addEventListener("submit", e => {
  e.preventDefault(); result.className = "result"; result.textContent = "";
  const f = Object.fromEntries(new FormData(form)); let bad = false;
  for (const k in rules) {
    const msg = rules[k](f[k] || ""); $(`[data-for="${k}"]`).textContent = msg;
    form.elements[k].setAttribute("aria-invalid", !!msg); if (msg) bad = true;
  }
  if (bad) return form.querySelector('[aria-invalid="true"]').focus();
  if (!f.website) {
    try {
      const all = JSON.parse(localStorage.getItem("uf_requests") || "[]");
      all.push({ name: f.name.trim(), phone: f.phone.trim(), plan: f.plan, message: f.message.trim(), status: "new", at: new Date().toISOString() });
      localStorage.setItem("uf_requests", JSON.stringify(all));
    } catch {}
  }
  result.className = "result ok"; result.textContent = "Request received. We will contact you shortly."; form.reset();
});
