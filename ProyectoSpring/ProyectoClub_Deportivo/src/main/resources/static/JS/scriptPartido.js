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

const RESULTADO_LABELS = {
  ganado: { label: 'Ganado', cls: 'badge-green' },
  empatado: { label: 'Empatado', cls: 'badge-warn' },
  perdido: { label: 'Perdido', cls: 'badge-red' },
  suspendido: { label: 'Suspendido', cls: 'badge-muted' },
  cancelado: { label: 'Cancelado', cls: 'badge-muted' },
  por_disputar: { label: 'Por disputar', cls: 'badge-blue' },
};

async function buscarPartidos() {
  const rival = document.getElementById('busRival').value.trim();
  const equipo = document.getElementById('busEquipo').value.trim();
  let url = 'http://localhost:8080/busquedaPartidos?';
  if (rival) url += `rival=${encodeURIComponent(rival)}&`;
  if (equipo) url += `EQUIPO_id_equipo=${encodeURIComponent(equipo)}`;

  document.getElementById('tabla').innerHTML = `
    <tr><td colspan="9"><div class="empty-state"><div class="icon">⏳</div><p>Cargando...</p></div></td></tr>`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    renderTabla(await resp.json());
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
    document.getElementById('tabla').innerHTML = `
      <tr><td colspan="9"><div class="empty-state"><div class="icon">⚠️</div><p>Error al cargar datos</p></div></td></tr>`;
  }
}

function renderTabla(partidos) {
  const tbody = document.getElementById('tabla');
  const esAdmin = document.body.classList.contains('is-admin');
  if (!partidos.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="icon">🏟️</div><p>No se encontraron partidos</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = partidos.map(p => {
    const res = RESULTADO_LABELS[p.resultado] || { label: p.resultado, cls: 'badge-muted' };
    const goles = (p.goles_a_favor != null && p.goles_en_contra != null)
      ? `${p.goles_a_favor} — ${p.goles_en_contra}` : '—';
    const hora = p.hora ? p.hora.substring(0, 5) : '—';
    return `
    <tr>
      <td>${p.id_partido}</td>
      <td>${p.fecha}</td>
      <td>${hora}</td>
      <td>${p.rival}</td>
      <td>${p.lugar}</td>
      <td>${p.local}</td>
      <td><span class="badge ${res.cls}">${res.label}</span></td>
      <td>${goles}</td>
      <td>
        <div class="td-actions">
          ${esAdmin ? `
            <button class="btn btn-icon btn-outline" title="Modificar"
              onclick="abrirModalModificar(${p.id_partido},${p.eQUIPO_id_equipo},'${esc(p.rival)}','${p.fecha}','${p.hora}','${esc(p.lugar)}','${esc(p.local)}','${p.resultado}',${p.goles_a_favor ?? 'null'},${p.goles_en_contra ?? 'null'})">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-icon btn-danger" title="Eliminar" onclick="eliminarPartido(${p.id_partido})">
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>` : '<span style="color:var(--text-muted);font-size:12px">—</span>'}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function esc(str) { return String(str).replace(/'/g, "\\'"); }
function limpiarFiltros() {
  document.getElementById('busRival').value = '';
  document.getElementById('busEquipo').value = '';
  buscarPartidos();
}

function abrirModalCrear() {
  ['cEquipo','cRival','cFecha','cHora','cLugar','cLocal','cGolesF','cGolesC'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('cResultado').value = 'por_disputar';
  document.getElementById('modalCrear').classList.add('open');
}

async function crearPartido() {
  const equipo = document.getElementById('cEquipo').value.trim();
  const rival = document.getElementById('cRival').value.trim();
  const fecha = document.getElementById('cFecha').value;
  const hora = document.getElementById('cHora').value;
  const lugar = document.getElementById('cLugar').value.trim();
  const local = document.getElementById('cLocal').value.trim();
  const resultado = document.getElementById('cResultado').value;
  const golesF = document.getElementById('cGolesF').value.trim();
  const golesC = document.getElementById('cGolesC').value.trim();

  if (!equipo || !rival || !fecha || !hora || !lugar || !local) {
    showToast('Rellena los campos obligatorios', 'error'); return;
  }

  let url = `http://localhost:8080/crearPartido?EQUIPO_id_equipo=${equipo}&rival=${encodeURIComponent(rival)}&fecha=${fecha}&hora=${hora}:00&lugar=${encodeURIComponent(lugar)}&local=${encodeURIComponent(local)}&resultado=${resultado}`;
  if (golesF) url += `&goles_a_favor=${golesF}`;
  if (golesC) url += `&goles_en_contra=${golesC}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Partido creado', 'success');
    cerrarModales();
    buscarPartidos();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

function abrirModalModificar(id, equipo, rival, fecha, hora, lugar, local, resultado, golesF, golesC) {
  document.getElementById('mId').value = id;
  document.getElementById('mEquipo').value = equipo;
  document.getElementById('mRival').value = rival;
  document.getElementById('mFecha').value = fecha;
  document.getElementById('mHora').value = hora ? hora.substring(0, 5) : '';
  document.getElementById('mLugar').value = lugar;
  document.getElementById('mLocal').value = local;
  document.getElementById('mResultado').value = resultado;
  document.getElementById('mGolesF').value = golesF !== null ? golesF : '';
  document.getElementById('mGolesC').value = golesC !== null ? golesC : '';
  document.getElementById('modalModificar').classList.add('open');
}

async function ejecutarModificar() {
  const id = document.getElementById('mId').value;
  const equipo = document.getElementById('mEquipo').value.trim();
  const rival = document.getElementById('mRival').value.trim();
  const fecha = document.getElementById('mFecha').value;
  const hora = document.getElementById('mHora').value;
  const lugar = document.getElementById('mLugar').value.trim();
  const local = document.getElementById('mLocal').value.trim();
  const resultado = document.getElementById('mResultado').value;
  const golesF = document.getElementById('mGolesF').value.trim();
  const golesC = document.getElementById('mGolesC').value.trim();

  if (!equipo || !rival || !fecha || !hora || !lugar || !local) {
    showToast('Rellena los campos obligatorios', 'error'); return;
  }

  let url = `http://localhost:8080/modificarPartido?id_partido=${id}&EQUIPO_id_equipo=${equipo}&rival=${encodeURIComponent(rival)}&fecha=${fecha}&hora=${hora}:00&lugar=${encodeURIComponent(lugar)}&local=${encodeURIComponent(local)}&resultado=${resultado}`;
  if (golesF) url += `&goles_a_favor=${golesF}`;
  if (golesC) url += `&goles_en_contra=${golesC}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Partido modificado', 'success');
    cerrarModales();
    buscarPartidos();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

async function eliminarPartido(id) {
  if (!confirm('¿Eliminar este partido?')) return;
  try {
    const resp = await fetch(`http://localhost:8080/eliminarPartido?id_partido=${id}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Partido eliminado', 'success');
    buscarPartidos();
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

buscarPartidos();
