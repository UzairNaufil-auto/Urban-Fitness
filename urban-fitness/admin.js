/* Urban Fitness admin DEMO. All data is invented and lives in memory only: a reload resets it. */
const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const fmt = d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const money = n => "PKR " + n.toLocaleString("en-US");
const PLANS = [
  { name: "Alpha", price: 2000, desc: "Bodybuilding with manual equipment.", on: true },
  { name: "Bravo", price: 3500, desc: "Cardio with electronic machines.", on: true },
  { name: "Charlie", price: 6500, desc: "Strength training with a personal trainer.", on: true, pt: true },
  { name: "Delta", price: 8000, desc: "Full personal training, bodybuilding and cardio together.", on: true, pt: true }
];
const price = n => PLANS.find(p => p.name === n).price;
const REQS = [
  ["Hamza Siddiqui","0300-0000101","Alpha","Do you have a trial day?","new",0],["Bilal Raza","0300-0000102","Charlie","Want to lose weight before my wedding.","new",0],
  ["Usman Farooqui","0300-0000103","Bravo","","new",1],["Daniyal Khan","0300-0000104","Delta","Can I train with a coach on weekends?","contacted",2],
  ["Shahzaib Ahmed","0300-0000105","Alpha","","contacted",3],["Taha Memon","0300-0000106","Bravo","Is there parking nearby?","approved",4],
  ["Arsalan Qureshi","0300-0000107","Charlie","","approved",5],["Zain Abbas","0300-0000108","Alpha","","rejected",6],
  ["Moiz Hussain","0300-0000109","Delta","I train for cricket, need a plan.","approved",8],["Haris Javed","0300-0000110","Bravo","","new",1]
].map((r, i) => ({ id: i, name: r[0], phone: r[1], plan: r[2], msg: r[3], status: r[4], when: day(-r[5]) }));
const MEMS = [
  ["Kashif Iqbal","Delta",120,12],["Fahad Malik","Charlie",80,3],["Saad Ansari","Alpha",200,-4],["Rehan Shaikh","Bravo",45,20],
  ["Owais Naqvi","Alpha",30,1],["Junaid Baig","Charlie",150,25],["Adnan Rizvi","Bravo",95,-10],["Faizan Ali","Alpha",15,15],
  ["Nabeel Hashmi","Delta",60,6],["Talha Mirza","Alpha",300,9],["Imran Dar","Bravo",22,8],["Hassan Butt","Charlie",75,18],
  ["Waqas Ghani","Alpha",40,-2],["Yasir Hameed","Delta",10,28],["Shoaib Lakhani","Bravo",110,14],["Ammar Yousuf","Alpha",5,26]
].map(m => ({ name: m[0], plan: m[1], since: day(-m[2]), ends: day(m[3]), left: m[3] }));
const mstat = m => m.left < 0 ? "Expired" : m.left <= 7 ? "Expiring" : "Active";
const badge = s => el("span", "badge b-" + s.toLowerCase(), s[0].toUpperCase() + s.slice(1));
const td = c => { const t = el("td"); c instanceof Node ? t.append(c) : t.textContent = c; return t; };
function table(heads, rows) {
  const w = el("div", "wrap"), t = el("table"), h = el("tr"); heads.forEach(x => h.append(el("th", "", x)));
  t.append(h); rows.forEach(r => { const tr = el("tr"); r.forEach(c => tr.append(td(c))); t.append(tr); }); w.append(t); return w;
}
const toast = m => { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 2200); };

/* views */
function dashboard() {
  const v = $("#v-dashboard"); v.replaceChildren();
  const active = MEMS.filter(m => m.left >= 0), rev = active.reduce((s, m) => s + price(m.plan), 0);
  const stats = el("div", "stats");
  [["New requests", REQS.filter(r => r.status === "new").length], ["Active members", active.length], ["Expiring in 7 days", MEMS.filter(m => mstat(m) === "Expiring").length], ["Monthly fees (sample)", money(rev)]]
    .forEach(([l, n]) => { const s = el("div", "stat"); s.append(el("b", "", n), el("span", "", l)); stats.append(s); });
  const cols = el("div", "cols"), a = el("div", "panel"), b = el("div", "panel");
  a.append(el("h3", "", "Members by plan"));
  PLANS.forEach(p => { const c = MEMS.filter(m => m.plan === p.name && m.left >= 0).length, r = el("div", "bar"), i = el("i"); i.style.width = c / active.length * 100 + "%"; r.append(el("span", "", p.name), i, el("b", "", c)); a.append(r); });
  b.append(el("h3", "", "Latest requests"));
  const ul = el("ul", "list"); REQS.filter(r => r.status === "new").slice(0, 5).forEach(r => { const li = el("li"), d = el("div"); d.append(r.name, el("small", "", r.plan + " | " + fmt(r.when))); li.append(d, badge("new")); ul.append(li); });
  b.append(ul); cols.append(a, b); v.append(stats, cols);
}
let reqFilter = "all";
function requests() {
  const v = $("#v-requests"); v.replaceChildren();
  const tools = el("div", "tools");
  ["all", "new", "contacted", "approved", "rejected"].forEach(f => {
    const n = f === "all" ? REQS.length : REQS.filter(r => r.status === f).length;
    const c = el("button", "chip" + (reqFilter === f ? " on" : ""), `${f[0].toUpperCase() + f.slice(1)} (${n})`); c.onclick = () => { reqFilter = f; requests(); }; tools.append(c);
  });
  const rows = REQS.filter(r => reqFilter === "all" || r.status === reqFilter).map(r => {
    const sel = el("select"); ["new", "contacted", "approved", "rejected"].forEach(s => { const o = el("option", "", s[0].toUpperCase() + s.slice(1)); o.value = s; sel.append(o); });
    sel.value = r.status; sel.onchange = () => { r.status = sel.value; sync(); requests(); toast("Status updated (demo)"); };
    const view = el("button", "btn sm dk", "View"); view.onclick = () => modal(r);
    const del = el("button", "chip", "Delete"); del.onclick = () => { if (confirm("Delete this request? (demo)")) { REQS.splice(REQS.indexOf(r), 1); sync(); requests(); } };
    const act = el("div", "tools"); act.style.margin = 0; act.append(view, del);
    return [fmt(r.when), r.name, r.phone, r.plan, sel, act];
  });
  v.append(tools, rows.length ? table(["Date", "Name", "Phone", "Plan", "Status", ""], rows) : el("p", "", "No requests in this view."));
}
function members(q = "") {
  const v = $("#v-members"); v.replaceChildren();
  const tools = el("div", "tools"), s = el("input"); s.placeholder = "Search by name"; s.value = q; s.setAttribute("aria-label", "Search members");
  s.oninput = () => { members(s.value); const n = $("#v-members input"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }; tools.append(s);
  const rows = MEMS.filter(m => m.name.toLowerCase().includes(q.toLowerCase())).map(m => [m.name, m.plan, fmt(m.since), fmt(m.ends), badge(mstat(m))]);
  v.append(tools, table(["Member", "Plan", "Joined", "Renews / ends", "Status"], rows));
}
function plans() {
  const v = $("#v-plans"); v.replaceChildren();
  const g = el("div", "plans");
  PLANS.forEach(p => {
    const c = el("div", "pcard" + (p.pt ? " pt" : "")); c.append(el("h3", "", p.name));
    const l1 = el("label", "", "Price (PKR per month)"), pr = el("input"); pr.type = "number"; pr.value = p.price; l1.append(pr);
    const l2 = el("label", "", "Description"), ds = el("input"); ds.value = p.desc; l2.append(ds);
    const r = el("label", "row"), ck = el("input"); ck.type = "checkbox"; ck.checked = p.on; r.append(ck, "Show on the public site");
    const sv = el("button", "btn sm", "Save plan"); sv.style.justifySelf = "start";
    sv.onclick = () => { p.price = +pr.value || 0; p.desc = ds.value; p.on = ck.checked; toast(p.name + " saved (demo: not stored)"); dashboard(); };
    c.append(l1, l2, r, sv); g.append(c);
  });
  v.append(g);
}
function modal(r) {
  const b = $("#m-body"); b.replaceChildren();
  const h = el("h3", "", r.name); h.id = "m-title";
  b.append(h, el("p", "", "Phone: " + r.phone), el("p", "", "Plan: " + r.plan), el("p", "", "Received: " + fmt(r.when)), el("p", "", "Message: " + (r.msg || "No message.")), badge(r.status));
  const a = el("div", "acts");
  [["Mark contacted", "contacted"], ["Approve", "approved"], ["Reject", "rejected"]].forEach(([t, s], i) => { const x = el("button", "btn sm" + (i ? " dk" : ""), t); x.onclick = () => { r.status = s; sync(); requests(); $("#modal").hidden = true; toast("Status updated (demo)"); }; a.append(x); });
  b.append(a); $("#modal").hidden = false;
}
const sync = () => { const n = REQS.filter(r => r.status === "new").length; $("#badge").textContent = n || ""; dashboard(); };
const views = { dashboard, requests, members, plans }, titles = { dashboard: "Dashboard", requests: "Membership requests", members: "Members", plans: "Plans" };
$("#nav").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return; const k = b.dataset.view;
  document.querySelectorAll("#nav button").forEach(x => x.classList.toggle("on", x === b));
  document.querySelectorAll(".view").forEach(x => x.hidden = x.id !== "v-" + k);
  $("#title").textContent = titles[k]; views[k]();
});
$("#login-form").addEventListener("submit", e => { e.preventDefault(); $("#login").hidden = true; $("#app").hidden = false; sync(); });
$("#logout").onclick = () => { $("#app").hidden = true; $("#login").hidden = false; };
$("#m-close").onclick = () => $("#modal").hidden = true;
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") e.target.hidden = true; });
document.addEventListener("keydown", e => { if (e.key === "Escape") $("#modal").hidden = true; });
