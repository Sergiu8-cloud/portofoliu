/* ---------------- DATA ---------------- */
const SERVICES = [
  {id:'clasica', name:'Manichiură clasica', price:100, priceLabel:'100 RON', duration:80, note:''},
  {id:'semi', name:'Manichiură semipermanentă', price:170, priceLabel:'170 RON', duration:110, note:''},
  {id:'gel', name:'Manichiură cu gel / întreținere', price:190, priceLabel:'190 RON', duration:130, note:'mărime 1/2 – 3/4'},
  {id:'slim', name:'Manichiură Slim', price:220, priceLabel:'220 RON', duration:140, note:''},
  {id:'pedi', name:'Pedichiură semipermanentă', price:170, priceLabel:'170 RON', duration:110, note:''},
  {id:'pachet', name:'Pachet Pedichiură + Manichiură', price:270, priceLabel:'de la 340 RON', duration:250, note:'în funcție de tipul manichiurii'},
];

const GALLERY = [
  {src:'images/gallery-1.jpg', tag:'Manichiură semipermanentă' ,cap:''},
  {src:'images/gallery-2.jpg', tag:'Manichiură slim' ,cap:''},
  {src:'images/gallery-3.jpg', tag:'Manichiură gel' ,cap:''},
  {src:'images/gallery-4.jpg', tag:'Migdala Slim', cap:''},
];

/* ---------------- RENDER SERVICES ---------------- */
const svcIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>`;

function fmtDuration(min){
  const h = Math.floor(min/60), m = min%60;
  if(h && m) return `${h}h ${m}m`;
  if(h) return `${h}h`;
  return `${m}m`;
}

const svcGrid = document.getElementById('svcGrid');
SERVICES.forEach(s=>{
  const el = document.createElement('div');
  el.className='svc-card';
  el.innerHTML = `
    <div class="svc-top">
      <h3>${s.name}</h3>
      <div class="svc-price">${s.priceLabel}</div>
    </div>
    ${s.note?`<div class="svc-note">${s.note}</div>`:''}
    <div class="svc-dur">${svcIcon} ${fmtDuration(s.duration)}</div>
  `;
  svcGrid.appendChild(el);
});

/* ---------------- RENDER GALLERY ---------------- */
const galGrid = document.getElementById('galGrid');
GALLERY.forEach(g=>{
  const el = document.createElement('div');
  el.className='gal-item';
  el.innerHTML = `
    <div class="gal-photo"><img src="${g.src}" alt="${g.cap}"></div>
    <div class="gal-info">
      <span class="gal-tag">${g.tag}</span>
      <div class="gal-cap">${g.cap}</div>
    </div>
  `;
  el.querySelector('.gal-photo').addEventListener('click', ()=>openLightbox(g.src));
  galGrid.appendChild(el);
});

const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
function openLightbox(src){ lbImg.src=src; lightbox.classList.add('open'); }
document.getElementById('lbClose').addEventListener('click', ()=>lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) lightbox.classList.remove('open'); });

/* ---------------- NAV ---------------- */
const burger = document.getElementById('burger');
const navlinks = document.getElementById('navlinks');
burger.addEventListener('click', ()=>navlinks.classList.toggle('open'));
navlinks.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>navlinks.classList.remove('open')));

/* ---------------- REVEAL ON SCROLL ---------------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); } });
}, {threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ---------------- PROGRAMARE PRIN WHATSAPP ---------------- */
const WHATSAPP_NUMBER = '40748607772'; // 0748607772, în format internațional fără +

function telefonValid(t){
  let c = String(t||'').replace(/\D/g,'');
  if(c.startsWith('0040')) c = c.slice(4);
  else if(c.startsWith('40') && c.length>10) c = c.slice(2);
  if(c.length===9 && c[0]!=='0') c = '0'+c;
  return /^(07[2-9]\d{7}|0[23]\d{8})$/.test(c);
}

/* la tastare acceptăm doar cifre și simbolul + (pentru +40) — orice altceva
   ar face numărul evident invalid, mai bine oprim direct la scriere */
const waPhoneInput = document.getElementById('waPhone');
waPhoneInput.addEventListener('input', ()=>{
  const start = waPhoneInput.selectionStart;
  const before = waPhoneInput.value;
  waPhoneInput.value = before.replace(/[^\d+\s]/g, '');
  if(start!==null) waPhoneInput.setSelectionRange(start - (before.length-waPhoneInput.value.length), start - (before.length-waPhoneInput.value.length));
});

let waService = null;

const waSelect = document.getElementById('waSelect');
const waSelectBtn = document.getElementById('waSelectBtn');
const waSelectList = document.getElementById('waSelectList');
const waSelectLabel = document.getElementById('waSelectLabel');

SERVICES.forEach(s=>{
  const el = document.createElement('div');
  el.className = 'wa-option';
  el.textContent = `${s.name} — ${s.priceLabel}`;
  el.addEventListener('click', ()=>{
    waService = s;
    waSelectLabel.textContent = s.name;
    waSelect.classList.remove('open');
  });
  waSelectList.appendChild(el);
});

waSelectBtn.addEventListener('click', ()=> waSelect.classList.toggle('open'));
document.addEventListener('click', (e)=>{
  if(!waSelect.contains(e.target)) waSelect.classList.remove('open');
});

function arataMesajWa(text, reusit){
  const el = document.getElementById('waMsg');
  el.textContent = text;
  el.className = 'wa-msg ' + (reusit ? 'ok' : 'err');
}

document.getElementById('waSendBtn').addEventListener('click', ()=>{
  const name = document.getElementById('waName').value.trim();
  const phone = document.getElementById('waPhone').value.trim();

  if(!name){
    arataMesajWa('Te rugăm completează numele și prenumele.', false);
    return;
  }
  if(!waService){
    arataMesajWa('Alege serviciul dorit.', false);
    return;
  }
  if(!phone){
    arataMesajWa('Completează numărul de telefon.', false);
    return;
  }
  if(!telefonValid(phone)){
    arataMesajWa('Numărul trebuie să fie un număr valid din România (ex: 07xx xxx xxx).', false);
    return;
  }

  arataMesajWa('', true);
  const mesaj = `Bună! Aș dori să fac o programare la Casiana Nails.\nNume: ${name}\nServiciu: ${waService.name}\nTelefon: ${phone}`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mesaj)}`;
  window.open(url, '_blank');
});