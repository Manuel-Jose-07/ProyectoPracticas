// ── Sesión ───────────────────────────────────────────────
(function initSesion() {
  const rol = sessionStorage.getItem('rol');
  if (!rol) { window.location.href = 'login.html'; return; }
  if (rol === 'admin') document.body.classList.add('is-admin');
  renderNavUser(rol, sessionStorage.getItem('usuario') || '');
})();

function renderNavUser(rol, nombre) {
  const right = document.querySelector('.nav-right');
  if (!right) return;
  right.innerHTML = `
    <span class="nav-role-badge ${rol}"><span class="dot"></span>${nombre} · ${rol === 'admin' ? 'Administrador' : 'Usuario'}</span>
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

async function buscarStaff() {
  const nombre = document.getElementById('busNombre').value.trim();
  const cargo = document.getElementById('busCargo').value.trim();
  let url = 'http://localhost:8080/busquedaStaff?';
  if (nombre) url += `nombre=${encodeURIComponent(nombre)}&`;
  if (cargo) url += `cargo=${encodeURIComponent(cargo)}`;

  document.getElementById('tabla').innerHTML = `
    <tr><td colspan="5"><div class="empty-state"><div class="icon">⏳</div><p>Cargando...</p></div></td></tr>`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    renderTabla(await resp.json());
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
    document.getElementById('tabla').innerHTML = `
      <tr><td colspan="5"><div class="empty-state"><div class="icon">⚠️</div><p>Error al cargar datos</p></div></td></tr>`;
  }
}

function renderTabla(staff) {
  const tbody = document.getElementById('tabla');
  const esAdmin = document.body.classList.contains('is-admin');
  if (!staff.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">🧑‍💼</div><p>No se encontró staff</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = staff.map(s => `
    <tr>
      <td>${s.id_cuerpo_tecnico}</td>
      <td>${s.nombre}</td>
      <td>${s.cargo}</td>
      <td><span class="badge ${s.activo ? 'badge-green' : 'badge-red'}">${s.activo ? 'Activo' : 'Inactivo'}</span></td>
      <td>
        <div class="td-actions">
          ${esAdmin ? `
            <button class="btn btn-icon btn-outline" title="Modificar"
              onclick="abrirModalModificar(${s.id_cuerpo_tecnico},'${esc(s.nombre)}','${esc(s.cargo)}',${s.activo})">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-icon btn-danger" title="Eliminar" onclick="eliminarStaff(${s.id_cuerpo_tecnico})">
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>` : '<span style="color:var(--text-muted);font-size:12px">—</span>'}
        </div>
      </td>
    </tr>`).join('');
}

function esc(str) { return String(str).replace(/'/g, "\\'"); }
function limpiarFiltros() {
  document.getElementById('busNombre').value = '';
  document.getElementById('busCargo').value = '';
  buscarStaff();
}

function abrirModalCrear() {
  document.getElementById('cNombre').value = '';
  document.getElementById('cCargo').value = '';
  document.getElementById('cActivo').value = 'true';
  document.getElementById('modalCrear').classList.add('open');
}

async function crearStaff() {
  const nombre = document.getElementById('cNombre').value.trim();
  const cargo = document.getElementById('cCargo').value.trim();
  const activo = document.getElementById('cActivo').value;
  if (!nombre || !cargo) { showToast('Rellena los campos obligatorios', 'error'); return; }

  try {
    const resp = await fetch(`http://localhost:8080/crearStaff?nombre=${encodeURIComponent(nombre)}&cargo=${encodeURIComponent(cargo)}&activo=${activo}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Staff creado', 'success');
    cerrarModales();
    buscarStaff();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

function abrirModalModificar(id, nombre, cargo, activo) {
  document.getElementById('mId').value = id;
  document.getElementById('mNombre').value = nombre;
  document.getElementById('mCargo').value = cargo;
  document.getElementById('mActivo').value = String(activo);
  document.getElementById('modalModificar').classList.add('open');
}

async function ejecutarModificar() {
  const id = document.getElementById('mId').value;
  const nombre = document.getElementById('mNombre').value.trim();
  const cargo = document.getElementById('mCargo').value.trim();
  const activo = document.getElementById('mActivo').value;
  if (!nombre || !cargo) { showToast('Rellena los campos obligatorios', 'error'); return; }

  try {
    const resp = await fetch(`http://localhost:8080/modificarStaff?id_staff=${id}&nombre=${encodeURIComponent(nombre)}&cargo=${encodeURIComponent(cargo)}&activo=${activo}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Staff modificado', 'success');
    cerrarModales();
    buscarStaff();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

async function eliminarStaff(id) {
  if (!confirm('¿Eliminar este miembro del staff?')) return;
  try {
    const resp = await fetch(`http://localhost:8080/eliminarStaff?id_staff=${id}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Staff eliminado', 'success');
    buscarStaff();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

function cerrarModales() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) cerrarModales();
  if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) cerrarModales();
  if (e.target.classList.contains('btn-outline') && e.target.closest('.modal-footer')) cerrarModales();
});

buscarStaff();
