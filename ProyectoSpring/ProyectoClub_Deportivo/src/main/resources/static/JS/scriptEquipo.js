// ── Sesión / Roles ───────────────────────────────────────
(function initSesion() {
  const rol = sessionStorage.getItem('rol');
  if (!rol) { window.location.href = 'login.html'; return; }
  if (rol === 'admin') document.body.classList.add('is-admin');
  renderNavUser(rol, sessionStorage.getItem('usuario') || '');
  // Ocultar th de Acciones para no-admin
  if (rol !== 'admin') {
    document.querySelectorAll('th.admin-only').forEach(th => th.style.display = 'none');
  }
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

// ── Buscar ───────────────────────────────────────────────
async function buscarEquipos() {
  const cat = document.getElementById('busCategoria').value.trim();
  const grp = document.getElementById('busGrupo').value.trim();
  let url = 'http://localhost:8080/busquedaEquipos?';
  if (cat) url += `categoria=${encodeURIComponent(cat)}&`;
  if (grp) url += `grupo=${encodeURIComponent(grp)}`;

  document.getElementById('tabla').innerHTML = `
    <tr><td colspan="5"><div class="empty-state"><div class="icon">⏳</div><p>Cargando...</p></div></td></tr>`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    renderTabla(await resp.json());
  } catch (e) {
    showToast('Error al buscar equipos: ' + e.message, 'error');
    document.getElementById('tabla').innerHTML = `
      <tr><td colspan="5"><div class="empty-state"><div class="icon">⚠️</div><p>Error al cargar datos</p></div></td></tr>`;
  }
}

function renderTabla(equipos) {
  const tbody = document.getElementById('tabla');
  const esAdmin = document.body.classList.contains('is-admin');
  if (!equipos.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">👕</div><p>No se encontraron equipos</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = equipos.map(e => `
    <tr>
      <td>${e.codigo}</td>
      <td>${e.descripcion || '—'}</td>
      <td>${e.categoria}</td>
      <td>${e.grupo}</td>
      ${esAdmin ? `<td>
        <div class="td-actions">
          <button class="btn btn-icon btn-outline" title="Modificar" onclick="abrirModalModificar(${e.id_equipo},'${esc(e.codigo)}','${esc(e.descripcion||'')}','${esc(e.categoria)}','${esc(e.grupo)}')">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-icon btn-danger" title="Eliminar" onclick="eliminarEquipo(${e.id_equipo})">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>` : ''}
    </tr>`).join('');
}

function esc(str) { return String(str).replace(/'/g, "\\'"); }

function limpiarFiltros() {
  document.getElementById('busCategoria').value = '';
  document.getElementById('busGrupo').value = '';
  document.getElementById('tabla').innerHTML = `
    <tr><td colspan="5"><div class="empty-state"><div class="icon">👕</div><p>Pulsa Buscar para cargar los equipos</p></div></td></tr>`;
}

// ── Modal Crear ──────────────────────────────────────────
function abrirModalCrear() {
  ['cCodigo','cDescripcion','cCategoria','cGrupo'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('modalCrear').classList.add('open');
}

async function crearEquipo() {
  const codigo = document.getElementById('cCodigo').value.trim();
  const descripcion = document.getElementById('cDescripcion').value.trim();
  const categoria = document.getElementById('cCategoria').value.trim();
  const grupo = document.getElementById('cGrupo').value.trim();
  if (!codigo || !categoria || !grupo) { showToast('Rellena los campos obligatorios', 'error'); return; }

  let url = `http://localhost:8080/crearEquipo?codigo=${encodeURIComponent(codigo)}&categoria=${encodeURIComponent(categoria)}&grupo=${encodeURIComponent(grupo)}`;
  if (descripcion) url += `&descripcion=${encodeURIComponent(descripcion)}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Equipo creado correctamente', 'success');
    cerrarModales(); buscarEquipos();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

// ── Modal Modificar ──────────────────────────────────────
function abrirModalModificar(id, codigo, descripcion, categoria, grupo) {
  document.getElementById('mId').value = id;
  document.getElementById('mCodigo').value = codigo;
  document.getElementById('mDescripcion').value = descripcion;
  document.getElementById('mCategoria').value = categoria;
  document.getElementById('mGrupo').value = grupo;
  document.getElementById('modalModificar').classList.add('open');
}

async function ejecutarModificar() {
  const id = document.getElementById('mId').value;
  const codigo = document.getElementById('mCodigo').value.trim();
  const descripcion = document.getElementById('mDescripcion').value.trim();
  const categoria = document.getElementById('mCategoria').value.trim();
  const grupo = document.getElementById('mGrupo').value.trim();
  if (!codigo || !categoria || !grupo) { showToast('Rellena los campos obligatorios', 'error'); return; }

  let url = `http://localhost:8080/modificarEquipo?id_equipo=${id}&codigo=${encodeURIComponent(codigo)}&categoria=${encodeURIComponent(categoria)}&grupo=${encodeURIComponent(grupo)}`;
  if (descripcion) url += `&descripcion=${encodeURIComponent(descripcion)}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Equipo modificado', 'success');
    cerrarModales(); buscarEquipos();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

// ── Eliminar ─────────────────────────────────────────────
async function eliminarEquipo(id) {
  if (!confirm('¿Eliminar este equipo? Se borrarán también sus partidos y relaciones.')) return;
  try {
    const resp = await fetch(`http://localhost:8080/eliminarEquipo?id_equipo=${id}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Equipo eliminado', 'success');
    buscarEquipos();
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
  if (e.key === 'Enter' && !document.querySelector('.modal-overlay.open')) buscarEquipos();
});