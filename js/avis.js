/* Avis Google : section « Ils nous ont fait confiance ».
   Lit l'API publique (lecture seule) et remplit #avis. Si l'appel échoue, est trop lent
   ou ne renvoie aucun avis, la section reste cachée (attribut hidden) : rien ne s'affiche.
   Tout le texte reçu est injecté via textContent, jamais via innerHTML. */
(function () {
  'use strict';
  var URL_WEBHOOK = 'https://n8n.zerotache.pro/webhook/greedycake-avis';
  var TIMEOUT_MS = 5000;
  var MAX_AVIS = 6;

  var section = document.getElementById('avis');
  if (!section || !window.fetch) return;

  var CSS = [
    '.avis{padding:64px 0}',
    '.avis-in{max-width:1180px;margin:0 auto;padding:0 28px}',
    '.avis-head{max-width:640px;margin-bottom:30px}',
    '.avis-head h2{font-family:"Cormorant Garamond",serif;font-weight:500;font-size:clamp(1.9rem,4vw,2.7rem);line-height:1.1;text-wrap:balance}',
    '.avis-sub{margin-top:10px;color:var(--ink-soft);font-size:1rem}',
    '.avis-list{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;list-style:none;margin:0;padding:0}',
    '.avis-card{background:var(--card,var(--ground));border:1px solid var(--line);border-radius:18px;padding:22px 22px 20px;display:flex;flex-direction:column;gap:12px}',
    '.avis-card .avis-stars{color:var(--gold);letter-spacing:.1em;font-size:1.05rem;line-height:1}',
    '.avis-card .avis-stars .off{opacity:.28}',
    '.avis-card blockquote{margin:0;color:var(--ink);font-size:.95rem;line-height:1.6;flex:1;white-space:pre-line;overflow-wrap:anywhere}',
    '.avis-card footer{font-size:.84rem;color:var(--ink-soft);display:flex;flex-wrap:wrap;gap:4px 10px;justify-content:space-between;border:0;padding:0}',
    '.avis-card .avis-author{font-family:"Cormorant Garamond",serif;font-size:1.12rem;font-weight:600;color:var(--ink)}',
    '.avis-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}',
    '.avis-btn{display:inline-flex;align-items:center;font-family:"Jost",system-ui,sans-serif;font-weight:500;font-size:.86rem;letter-spacing:.04em;padding:.85em 1.6em;border-radius:999px;border:1px solid var(--line);color:var(--ink);text-decoration:none;transition:transform .2s ease,border-color .2s ease,color .2s ease}',
    '.avis-btn:hover,.avis-btn:focus-visible{border-color:var(--gold);color:var(--gold);transform:translateY(-1px)}',
    '.avis-btn--main{background:var(--ink);color:var(--ground);border-color:var(--ink)}',
    '.avis-btn--main:hover,.avis-btn--main:focus-visible{background:var(--ink);color:var(--ground);border-color:var(--gold)}',
    '.avis-note{margin-top:16px;font-size:.78rem;color:var(--ink-soft);opacity:.8}',
    '@media(max-width:860px){',
    '.avis-in{padding:0 16px}',
    '.avis-list{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:14px;padding:2px 2px 12px;margin:0 -16px;padding-left:16px;padding-right:16px;-webkit-overflow-scrolling:touch}',
    '.avis-card{flex:0 0 84%;scroll-snap-align:center}',
    '}',
    '.avis--compact{padding:8px 0 26px}',
    '.avis--compact .avis-in{padding:0;max-width:none}',
    '.avis--compact .avis-list{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:14px;margin:0;padding:2px 0 12px}',
    '.avis--compact .avis-card{flex:0 0 82%;scroll-snap-align:center}',
    '.avis--compact .avis-head h2{font-size:clamp(1.5rem,4vw,1.9rem)}',
    '@media(prefers-reduced-motion:reduce){.avis-btn{transition:none}}'
  ].join('');

  function fail() { /* la section reste cachée */ }

  function stars(n) {
    var wrap = document.createElement('span');
    wrap.className = 'avis-stars';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', 'Note : ' + n + ' sur 5');
    for (var i = 1; i <= 5; i++) {
      var s = document.createElement('span');
      s.textContent = '★';
      s.setAttribute('aria-hidden', 'true');
      if (i > n) s.className = 'off';
      wrap.appendChild(s);
    }
    return wrap;
  }

  function moisAnnee(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return '';
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
    if (isNaN(d.getTime())) return '';
    try { return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }); }
    catch (e) { return ''; }
  }

  function render(data) {
    var list = document.getElementById('avis-list');
    var sub = document.getElementById('avis-sub');
    if (!list || !sub || !data || !Array.isArray(data.avis)) return fail();

    var items = [];
    data.avis.slice(0, MAX_AVIS).forEach(function (a) {
      if (!a || typeof a.texte !== 'string' || !a.texte.trim()) return;
      var note = Math.round(Number(a.note));
      if (!(note >= 1 && note <= 5)) return;
      items.push({ note: note, texte: a.texte.trim(), auteur: typeof a.auteur === 'string' ? a.auteur.trim() : '', date: moisAnnee(a.date) });
    });
    if (!items.length) return fail();

    items.forEach(function (it) {
      var li = document.createElement('li');
      li.className = 'avis-card';
      li.appendChild(stars(it.note));
      var q = document.createElement('blockquote');
      q.textContent = it.texte;
      li.appendChild(q);
      var f = document.createElement('footer');
      var au = document.createElement('span');
      au.className = 'avis-author';
      au.textContent = '— ' + (it.auteur || 'Client(e) Google');
      f.appendChild(au);
      if (it.date) {
        var dt = document.createElement('span');
        dt.textContent = it.date;
        f.appendChild(dt);
      }
      li.appendChild(f);
      list.appendChild(li);
    });

    var note = Number(data.note_moyenne), nb = Math.round(Number(data.nb_avis));
    if (note > 0 && note <= 5 && nb > 0) {
      sub.textContent = note.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) +
        ' ★ · ' + nb.toLocaleString('fr-FR') + ' avis Google';
    } else {
      sub.hidden = true;
    }

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    section.hidden = false;
  }

  function load() {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);
    fetch(URL_WEBHOOK, { method: 'GET', mode: 'cors', credentials: 'omit', headers: { 'Accept': 'application/json' }, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (data) { clearTimeout(timer); render(data); })
      .catch(function () { clearTimeout(timer); fail(); });
  }

  /* on attend la fin du chargement de la page : le script ne ralentit pas l'affichage */
  function start() {
    if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 2000 });
    else setTimeout(load, 300);
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
