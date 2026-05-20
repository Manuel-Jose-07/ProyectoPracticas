// ── Partículas ──────────────────────────────────────────
(function generarParticulas() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-duration: ${6 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 8}s;
      width: ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
      opacity: ${0.3 + Math.random() * 0.5};
    `;
    container.appendChild(p);
  }
})();

// ── Stats en el login ────────────────────────────────────
async function cargarStats() {
  try {
    const [jugadores, equipos, partidos] = await Promise.allSettled([
      fetch('http://localhost:8080/busquedaJugadores').then(r => r.json()),
      fetch('http://localhost:8080/busquedaEquipos').then(r => r.json()),
      fetch('http://localhost:8080/busquedaPartidos').then(r => r.json()),
    ]);
    animarNum('statJugadores', jugadores.status === 'fulfilled' ? jugadores.value.length : '—');
    animarNum('statEquipos', equipos.status === 'fulfilled' ? equipos.value.length : '—');
    animarNum('statPartidos', partidos.status === 'fulfilled' ? partidos.value.length : '—');
  } catch (_) { /* silencioso */ }
}

function animarNum(id, target) {
  const el = document.getElementById(id);
  if (!el || typeof target !== 'number') { el && (el.textContent = target); return; }
  let current = 0;
  const step = Math.ceil(target / 30);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 40);
}

cargarStats();

// ── Toggle contraseña (ojito) ────────────────────────────
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  // Cambiar icono: ojo abierto / ojo tachado
  btn.innerHTML = isPassword
    ? `<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>`
    : `<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>`;
}

// ── Panels ───────────────────────────────────────────────
function mostrarRegistro(e) {
  e.preventDefault();
  document.getElementById('loginPanel').classList.add('hidden');
  document.getElementById('registerPanel').classList.add('active');
  document.getElementById('errorMsg').classList.remove('visible');
}

function mostrarLogin(e) {
  e.preventDefault();
  document.getElementById('registerPanel').classList.remove('active');
  document.getElementById('loginPanel').classList.remove('hidden');
  document.getElementById('errorReg').classList.remove('visible');
}

// ── Acceder ──────────────────────────────────────────────
async function acceder() {
  const nombre = document.getElementById('usuInput').value.trim();
  const password = document.getElementById('passInput').value;
  const card = document.getElementById('accessCard');

  if (!nombre || !password) {
    mostrarError('Por favor rellena todos los campos', 'errorMsg');
    sacudir(card);
    return;
  }

  try {
    const resp = await fetch(`http://localhost:8080/login?nombre=${encodeURIComponent(nombre)}&password=${encodeURIComponent(password)}`);
    const rol = await resp.text();

    if (resp.status === 401 || rol === 'incorrecto') {
      mostrarError('Usuario o contraseña incorrectos', 'errorMsg');
      sacudir(card);
      return;
    }

    sessionStorage.setItem('rol', rol);
    sessionStorage.setItem('usuario', nombre);
    window.location.href = 'equipo.html';

  } catch (e) {
    mostrarError('No se pudo conectar con el servidor', 'errorMsg');
    sacudir(card);
  }
}

// ── Registrarse ──────────────────────────────────────────
async function registrarse() {
  const nombre = document.getElementById('regNombre').value.trim();
  const pass   = document.getElementById('regPass').value;
  const pass2  = document.getElementById('regPass2').value;
  const card   = document.getElementById('accessCard');

  if (!nombre || !pass || !pass2) {
    mostrarError('Por favor rellena todos los campos', 'errorReg');
    sacudir(card);
    return;
  }
  if (pass !== pass2) {
    mostrarError('Las contraseñas no coinciden', 'errorReg');
    sacudir(card);
    return;
  }

  try {
    const resp = await fetch(`http://localhost:8080/crearUsuario?nombre=${encodeURIComponent(nombre)}&password=${encodeURIComponent(pass)}&esAdmin=false`);
    if (!resp.ok) {
      mostrarError('Error al crear el usuario. Puede que el nombre ya esté en uso.', 'errorReg');
      sacudir(card);
      return;
    }
    // Éxito: volver al login con mensaje
    mostrarLogin({ preventDefault: () => {} });
    document.getElementById('usuInput').value = nombre;
    mostrarError('¡Cuenta creada! Ya puedes iniciar sesión', 'errorMsg');
    document.getElementById('errorMsg').style.color = 'var(--success, #4caf50)';
    setTimeout(() => {
      document.getElementById('errorMsg').style.color = '';
    }, 3500);
  } catch (e) {
    mostrarError('No se pudo conectar con el servidor', 'errorReg');
    sacudir(card);
  }
}

function mostrarError(msg, id = 'errorMsg') {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 3500);
}

function sacudir(el) {
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 400);
}

// Enter para acceder (en panel de login) o registrarse (en panel de registro)
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const regActivo = document.getElementById('registerPanel').classList.contains('active');
  if (regActivo) registrarse();
  else acceder();
});