
/* ====== Basic interactivity (no external libs) ====== */

// ====== Limitless Web: Edge API hook for Quote form (Cloudflare Pages Functions) ======
const EDGE_FORM_ENDPOINT = "/api/quotes"; // D1-backed API
const EDGE_API_ENABLED = true;

async function postEdgeQuote(data){
  const resp = await fetch(EDGE_FORM_ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  if(!resp.ok){
    const text = await resp.text().catch(()=> "");
    throw new Error("Błąd zapisu ("+resp.status+"): "+text);
  }
  return await resp.json().catch(()=>({ok:true}));
}

const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// Mobile nav toggle
const toggleBtn = $('.nav-toggle');
const navList = $('#nav-list');
if(toggleBtn){
  toggleBtn.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', String(open));
  });
  // Close on link click
  $$('#nav-list a').forEach(a => a.addEventListener('click', () => navList.classList.remove('open')));
}

// Sticky header shadow on scroll
const header = $('.site-header');
window.addEventListener('scroll', () => {
  const y = window.scrollY || 0;
  header.style.boxShadow = y > 4 ? '0 10px 30px rgba(0,0,0,.25)' : 'none';
});

// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
},{threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));

// Choose plan -> prefill hidden field and scroll to form
$$('.choose-plan').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const plan = btn.dataset.plan || '';
    const hidden = $('#selected-plan');
    if(hidden){ hidden.value = plan; }
    location.hash = '#kontakt';
    const name = $('#name');
    if(name){ name.focus(); }
  });
});

// ====== Lead form logic ======
// 1) Jeśli ustawisz FORMSPREE_ENDPOINT, wyśle przez fetch.
// 2) W przeciwnym razie zbuduje mailto do kontakt@limitless-web.pl.
const FORMSPREE_ENDPOINT = "/api/quotes"; // <- Wstaw endpoint Formspree, np. "https://formspree.io/f/xyzabcd"
const form = $('#lead-form');
const statusEl = $('#form-status');

function serializeForm(form){
  const fd = new FormData(form);
  const data = {};
  for(const [k,v] of fd.entries()){ data[k] = v; }
  return data;
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = "Wysyłanie...";
  const data = serializeForm(form);

  if(FORMSPREE_ENDPOINT){
    try{
      const resp = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(data)
      });
      if(resp.ok){
        statusEl.textContent = "Dziękujemy! Odezwiemy się w 24h.";
        form.reset();
        $('#selected-plan').value = "";
      } else {
        statusEl.textContent = "Ups, spróbuj ponownie lub wyślij maila bezpośrednio.";
      }
    }catch(err){
      statusEl.textContent = "Błąd sieci. Spróbuj ponownie.";
    }
  } else {
    // mailto fallback
    const subject = encodeURIComponent("Nowe zapytanie — Limitless Web");
    const body = encodeURIComponent(
`Imię: ${data.name}
E-mail: ${data.email}
Telefon: ${data.phone || '-'}
Firma: ${data.company || '-'}
Strona/fanpage: ${data.website || '-'}
Plan: ${data.plan || '-'}

Wiadomość:
${data.message}`
    );
    window.location.href = `mailto:kontakt@limitless-web.pl?subject=${subject}&body=${body}`;
    statusEl.textContent = "Otwieram program pocztowy...";
  }
});

// Back to top smooth click
$('.back-to-top')?.addEventListener('click', (e)=>{
  e.preventDefault();
  window.scrollTo({top: 0, behavior: 'smooth'});
});

// Replace footer year if needed
try{
  const y = window.SITE_YEAR || new Date().getFullYear();
  document.querySelector('.site-footer .footer-inner p').innerHTML = `© ${y} Limitless Web — wszystkie prawa zastrzeżone.`;
}catch{}


// Attach dedicated submit handler that prefers Edge API (does not change UI)
if(form){
  form.addEventListener('submit', async (e) => {
    try{
      e.preventDefault();
      statusEl.textContent = "Wysyłanie...";
      const data = serializeForm(form);
      if(EDGE_API_ENABLED){
        await postEdgeQuote({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          company: data.company || "",
          website: data.website || "",
          plan: data.plan || "",
          message: data.message || "",
          source: "lead-form"
        });
        statusEl.textContent = "Dziękujemy! Odezwiemy się w 24h.";
        form.reset();
        const selPlan = document.getElementById('selected-plan');
        if(selPlan) selPlan.value = "";
        return;
      }
    }catch(err){
      console.error(err);
      statusEl.textContent = "Ups, nie udało się wysłać. Spróbuj ponownie lub użyj e-maila.";
    }
  }, {capture: true});
}
