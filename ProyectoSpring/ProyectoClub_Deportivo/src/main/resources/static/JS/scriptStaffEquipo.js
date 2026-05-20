(function initSesion() {
  const rol = sessionStorage.getItem('rol');
  if (!rol) { window.location.href = 'login.html'; return; }
  if (rol !== 'admin') { window.location.href = 'equipo.html'; return; }
  document.body.classList.add('is-admin');
  renderNavUser(rol, sessionStorage.getItem('usuario') || '');
})();
function renderNavUser(rol, nombre) {
  const right = document.querySelector('.nav-right');
  if (!right) return;
  right.innerHTML = `<span class="nav-role-badge ${rol}"><span class="dot"></span>${nombre} · Administrador</span>
    <button class="nav-logout" onclick="logout()">
      <svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>Salir</button>`;
}
function logout() { sessionStorage.clear(); window.location.href = 'login.html'; }
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.className = 'toast '+type; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

async function buscarRelaciones() {
  const s = document.getElementById('busStaff').value.trim();
  const eq = document.getElementById('busEquipo').value.trim();
  document.getElementById('tabla').innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">⏳</div><p>Cargando...</p></div></td></tr>`;
  const tbody = document.getElementById('tabla');
  tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">ℹ️</div>
    <p>Usa el formulario para añadir relaciones staff-equipo. Para eliminar, introduce los IDs y pulsa Buscar.</p>
    <div style="margin-top:12px;display:flex;gap:8px;justify-content:center">
      ${s && eq ? `<button class="btn btn-danger" onclick="eliminarRelacion(${s},${eq})">Eliminar relación Staff:${s} — Equipo:${eq}</button>` : ''}
    </div>
  </div></td></tr>`;
}

function limpiarFiltros() {
  document.getElementById('busStaff').value = '';
  document.getElementById('busEquipo').value = '';
  document.getElementById('tabla').innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">🧑‍💼</div><p>Pulsa Buscar para cargar las relaciones</p></div></td></tr>`;
}

function abrirModalCrear() {
  document.getElementById('cStaff').value = '';
  document.getElementById('cEquipo').value = '';
  document.getElementById('modalCrear').classList.add('open');
}

async function crearRelacion() {
  const s = document.getElementById('cStaff').value.trim();
  const eq = document.getElementById('cEquipo').value.trim();
  if (!s || !eq) { showToast('Rellena los campos obligatorios', 'error'); return; }
  try {
    const resp = await fetch(`http://localhost:8080/crearStaffEquipo?STAFF_id_staff=${s}&EQUIPO_id_equipo=${eq}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Relación creada correctamente', 'success');
    cerrarModales();
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function eliminarRelacion(s, eq) {
  if (!confirm(`¿Eliminar la relación Staff ${s} — Equipo ${eq}?`)) return;
  try {
    const resp = await fetch(`http://localhost:8080/eliminarStaffEquipo?STAFF_id_staff=${s}&EQUIPO_id_equipo=${eq}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Relación eliminada', 'success');
    limpiarFiltros();
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

function cerrarModales() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) cerrarModales();
  if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) cerrarModales();
  if (e.target.classList.contains('btn-outline') && e.target.closest('.modal-footer')) cerrarModales();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !document.querySelector('.modal-overlay.open')) buscarRelaciones();
});