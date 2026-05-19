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

// ── Acceder ──────────────────────────────────────────────
async function acceder() {
  const nombre = document.getElementById('usuInput').value.trim();
  const password = document.getElementById('passInput').value;
  const card = document.getElementById('accessCard');
  const errorMsg = document.getElementById('errorMsg');

  if (!nombre || !password) {
    mostrarError('Por favor rellena todos los campos');
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 400);
    return;
  }

  try {
    const resp = await fetch(`http://localhost:8080/login?nombre=${encodeURIComponent(nombre)}&password=${encodeURIComponent(password)}`);
    const rol = await resp.text();

    if (resp.status === 401 || rol === 'incorrecto') {
      mostrarError('Usuario o contraseña incorrectos');
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 400);
      return;
    }

    // Guardar sesión
    sessionStorage.setItem('rol', rol);
    sessionStorage.setItem('usuario', nombre);

    // Redirigir
    window.location.href = 'equipo.html';

  } catch (e) {
    mostrarError('No se pudo conectar con el servidor');
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 400);
  }
}

function mostrarError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 3500);
}

// Enter para acceder
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') acceder();
});
