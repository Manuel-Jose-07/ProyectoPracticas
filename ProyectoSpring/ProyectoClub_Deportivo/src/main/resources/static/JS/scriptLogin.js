// ── 1. EFECTO VISUAL DE PARTÍCULAS ────────────────
const container = document.getElementById('particles');
if (container) {
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay   = (-Math.random() * 20) + 's';
    p.style.width  = (1 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    container.appendChild(p);
  }
}

// ── 2. FUNCIÓN DE INICIO DE SESIÓN CON SPRING ──────
async function acceder() {
  const usuario = document.getElementById('usuInput').value.trim();
  const password = document.getElementById('passInput').value;

  if (!usuario || !password) {
    mostrarError("Por favor, rellena todos los campos.");
    return;
  }

  try {
    // Apuntamos al backend directamente sin localhost:8080 para que no salte el bloqueo
    const url = `/login?nombre=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}`;
    
    const respuesta = await fetch(url);
    
    if (respuesta.ok) {
      // Leemos la respuesta como texto plano ("admin" o "usuario")
      const rolDetectado = await respuesta.text(); 
      
      // Guardamos en la memoria del navegador para recordar el rol en el index
      sessionStorage.setItem('rol', rolDetectado);
      sessionStorage.setItem('usuarioNombre', usuario);

      // Efecto visual de salida
      document.querySelector('.main-container').style.transition = 'opacity .4s, transform .4s';
      document.querySelector('.main-container').style.opacity    = '0';
      document.querySelector('.main-container').style.transform  = 'scale(.97)';
      
      // Como login.html e index.html están en la misma carpeta 'HTML', cargamos index.html a secas
      setTimeout(() => { 
        window.location.href = 'equipo.html'; 
      }, 400);

    } else {
      mostrarError("Usuario o contraseña incorrectos.");
    }

  } catch (error) {
    console.error(error);
    mostrarError("No se pudo conectar con la base de datos.");
  }
}

function mostrarError(mensaje) {
  const errorMsg = document.getElementById('errorMsg');
  const accessCard = document.getElementById('accessCard');
  
  errorMsg.textContent = mensaje;
  errorMsg.classList.add('visible');
  
  accessCard.classList.add('shake');
  setTimeout(() => accessCard.classList.remove('shake'), 400);
}

// Función para mostrar el error visualmente
function mostrarError(mensaje) {
  const errorMsg = document.getElementById('errorMsg');
  const accessCard = document.getElementById('accessCard');
  
  errorMsg.textContent = mensaje;
  errorMsg.classList.add('visible');
  
  accessCard.classList.add('shake');
  setTimeout(() => accessCard.classList.remove('shake'), 400);
}

function mostrarError(mensaje) {
  const errorMsg = document.getElementById('errorMsg');
  const accessCard = document.getElementById('accessCard');
  
  errorMsg.textContent = mensaje;
  errorMsg.classList.add('visible');
  
  accessCard.classList.add('shake');
  setTimeout(() => accessCard.classList.remove('shake'), 400);
}

// ── 3. CONTADORES DESDE LA BASE DE DATOS ───────────
async function cargarStats() {
  const API = 'http://localhost:8080';
  try {
    const [jugadores, equipos, partidos] = await Promise.all([
      fetch(`${API}/busquedaJugadores`).then(r => r.json()),
      fetch(`${API}/busquedaEquipos`).then(r => r.json()),
      fetch(`${API}/busquedaPartidos`).then(r => r.json()),
    ]);
    
    animarNumero('statJugadores', jugadores.length);
    animarNumero('statEquipos',   equipos.length);
    animarNumero('statPartidos',  partidos.length);
  } catch {
    ['statJugadores','statEquipos','statPartidos'].forEach(id => {
      if(document.getElementById(id)) document.getElementById(id).textContent = '0';
    });
  }
}

function animarNumero(id, final) {
  const el = document.getElementById(id);
  if (!el) return;
  const dur = 1200;
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * final);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
  cargarStats();
});