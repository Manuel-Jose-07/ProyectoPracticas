// ── Sesión ───────────────────────────────────────────────
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
  right.innerHTML = `
    <span class="nav-role-badge ${rol}"><span class="dot"></span>${nombre} · Administrador</span>
    <button class="nav-logout" onclick="logout()">
      <svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>Salir
    </button>`;
}

function logout() { sessionStorage.clear(); window.location.href = 'login.html'; }

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.className = 'toast ' + type;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Buscar ───────────────────────────────────────────────
async function buscarUsuarios() {
  const nombre = document.getElementById('busNombre').value.trim();
  const admin  = document.getElementById('busAdmin').value;
  let url = 'http://localhost:8080/busquedaUsuarios?';
  if (nombre) url += `nombre=${encodeURIComponent(nombre)}&`;
  if (admin !== '') url += `esAdmin=${admin}`;

  document.getElementById('tabla').innerHTML = `
    <tr><td colspan="3"><div class="empty-state"><div class="icon">⏳</div><p>Cargando...</p></div></td></tr>`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    renderTabla(await resp.json());
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
    document.getElementById('tabla').innerHTML = `
      <tr><td colspan="3"><div class="empty-state"><div class="icon">⚠️</div><p>Error al cargar datos</p></div></td></tr>`;
  }
}

function renderTabla(usuarios) {
  const tbody = document.getElementById('tabla');
  if (!usuarios.length) {
    tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state"><div class="icon">👤</div><p>No se encontraron usuarios</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = usuarios.map(u => `
    <tr>
      <td>${u.nombre}</td>
      <td><span class="badge ${u.esAdmin ? 'badge-blue' : 'badge-muted'}">${u.esAdmin ? 'Administrador' : 'Usuario'}</span></td>
      <td class="admin-only">
        <div class="td-actions">
          <button class="btn btn-icon btn-outline" title="Cambiar contraseña"
            onclick="abrirModalModificar('${esc(u.nombre)}')">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-icon btn-danger" title="Eliminar" onclick="eliminarUsuario('${esc(u.nombre)}')">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function esc(str) { return String(str).replace(/'/g, "\\'"); }

function limpiarFiltros() {
  document.getElementById('busNombre').value = '';
  document.getElementById('busAdmin').value = '';
  document.getElementById('tabla').innerHTML = `
    <tr><td colspan="3"><div class="empty-state"><div class="icon">👤</div><p>Pulsa Buscar para cargar los usuarios</p></div></td></tr>`;
}

// ── Modal Crear ──────────────────────────────────────────
function abrirModalCrear() {
  document.getElementById('cNombre').value = '';
  document.getElementById('cPassword').value = '';
  document.getElementById('cAdmin').value = 'false';
  document.getElementById('modalCrear').classList.add('open');
}

async function crearUsuario() {
  const nombre   = document.getElementById('cNombre').value.trim();
  const password = document.getElementById('cPassword').value;
  const esAdmin  = document.getElementById('cAdmin').value;

  if (!nombre || !password) { showToast('Rellena los campos obligatorios', 'error'); return; }

  try {
    const resp = await fetch(`http://localhost:8080/crearUsuario?nombre=${encodeURIComponent(nombre)}&password=${encodeURIComponent(password)}&esAdmin=${esAdmin}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Usuario creado correctamente', 'success');
    cerrarModales();
    buscarUsuarios();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

// ── Modal Modificar ──────────────────────────────────────
function abrirModalModificar(nombre) {
  document.getElementById('mNombre').value = nombre;
  document.getElementById('mPassword').value = '';
  document.getElementById('modalModificar').classList.add('open');
}

async function ejecutarModificar() {
  const nombre   = document.getElementById('mNombre').value;
  const password = document.getElementById('mPassword').value;
  if (!password) { showToast('Introduce la nueva contraseña', 'error'); return; }

  try {
    const resp = await fetch(`http://localhost:8080/modificarUsuario?nombre=${encodeURIComponent(nombre)}&password=${encodeURIComponent(password)}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Contraseña actualizada', 'success');
    cerrarModales();
    buscarUsuarios();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

// ── Eliminar ─────────────────────────────────────────────
async function eliminarUsuario(nombre) {
  const pass = prompt(`Introduce la contraseña de "${nombre}" para confirmarlo:`);
  if (pass === null) return;
  try {
    const resp = await fetch(`http://localhost:8080/eliminarUsuario?nombre=${encodeURIComponent(nombre)}&password=${encodeURIComponent(pass)}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Usuario eliminado', 'success');
    buscarUsuarios();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

// ── Cerrar modales ───────────────────────────────────────
function cerrarModales() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) cerrarModales();
  if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) cerrarModales();
  if (e.target.classList.contains('btn-outline') && e.target.closest('.modal-footer')) cerrarModales();
});

// Enter para buscar
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !document.querySelector('.modal-overlay.open')) buscarUsuarios();
});