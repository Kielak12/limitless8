
// Admin panel JS
const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');

async function api(path, opts={}){
  const res = await fetch(path, {...opts, headers: {'Content-Type': 'application/json', ...(opts.headers||{})}});
  if(res.status === 401){
    // Not logged in, redirect to login
    if(!location.pathname.endsWith('/login.html')){
      location.href = '/admin/login.html';
      return Promise.reject(new Error('Unauthorized'));
    }
  }
  return res;
}

loginForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  loginStatus.textContent = 'Logowanie...';
  const data = Object.fromEntries(new FormData(loginForm).entries());
  try{
    const res = await api('/api/login', {method:'POST', body: JSON.stringify(data)});
    if(res.ok){
      loginStatus.textContent = 'Zalogowano. Przekierowanie...';
      setTimeout(()=> location.href='/admin/', 500);
    }else{
      loginStatus.textContent = 'Błędne dane.';
    }
  }catch(err){
    console.error(err);
    loginStatus.textContent = 'Błąd logowania.';
  }
});

document.getElementById('logout-btn')?.addEventListener('click', async ()=>{
  await api('/api/logout', {method:'POST'});
  location.href = '/admin/login.html';
});

async function loadLeads(){
  const status = document.getElementById('admin-status');
  const tbody = document.querySelector('#leads-table tbody');
  const search = document.getElementById('search');
  status.textContent = 'Ładowanie...';

  try{
    const res = await api('/admin/data');
    if(!res.ok) throw new Error('HTTP '+res.status);
    const payload = await res.json();
    const rows = payload.items || [];
    const term = (search?.value||'').toLowerCase();

    const filtered = rows.filter(r =>
      !term || [r.name, r.email, r.phone, r.message].filter(Boolean).join(' ').toLowerCase().includes(term)
    );

    tbody.innerHTML = filtered.map(r => `
      <tr>
        <td>${new Date(r.created_at).toLocaleString()}</td>
        <td>${r.name||''}</td>
        <td>${r.email||''}</td>
        <td>${r.phone||''}</td>
        <td>${r.company||''}</td>
        <td>${r.website||''}</td>
        <td>${r.plan||''}</td>
        <td>${(r.message||'').replace(/</g,'&lt;')}</td>
        <td>${r.ip||''}</td>
      </tr>
    `).join('');
    status.textContent = `Wyników: ${filtered.length}`;
  }catch(err){
    console.error(err);
    status.textContent = 'Błąd pobierania danych.';
  }
}

if(location.pathname.endsWith('/admin/') || location.pathname.endsWith('/admin/index.html')){
  loadLeads();
  document.getElementById('search')?.addEventListener('input', loadLeads);
  document.getElementById('export')?.addEventListener('click', async ()=>{
    const res = await api('/admin/data');
    const payload = await res.json();
    const rows = payload.items || [];
    const header = ['created_at','name','email','phone','company','website','plan','message','ip'];
    const csv = [header.join(',')]
      .concat(rows.map(r => header.map(k => JSON.stringify(r[k] ?? '')).join(',')))
      .join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {href:url, download:'leads.csv'});
    document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
  });
}
