// ── 1. AL CARGAR LA PÁGINA: CONFIGURAR EL ROL ──
document.addEventListener("DOMContentLoaded", () => {
    const rol = sessionStorage.getItem('rol');
    
    // Si es administrador, añadimos 'is-admin' al body para usar el CSS de tu profesor
    if (rol === 'admin') {
        document.body.classList.add('is-admin');
    }
    // NOTA: No tocamos la tabla aquí. Se queda cargada la camiseta original del HTML.
});

// ── 2. FUNCIONES DE LOS FILTROS (BUSCAR Y LIMPIAR) ──

async function buscarEquipos() {
    const tabla = document.getElementById('tabla');
    
    // Capturamos lo que el usuario escribió usando tus IDs del HTML: busCategoria y busGrupo
    let categoria = document.getElementById('busCategoria').value.trim();
    let grupo = document.getElementById('busGrupo').value.trim();

    try {
        let url = `/busquedaEquipos`;
        let parametros = [];
        
        // SOLO añadimos parámetros a la URL si de verdad se ha escrito algo en los campos
        if (categoria !== "") {
            parametros.push(`categoria=${encodeURIComponent(categoria)}`);
        }
        if (grupo !== "") {
            parametros.push(`grupo=${encodeURIComponent(grupo)}`);
        }
        
        // Si hay filtros, se pegan (ej: /busquedaEquipos?categoria=Senior)
        // SI AMBOS CAMPOS ESTÁN VACÍOS, la URL irá limpia como "/busquedaEquipos" y tu Java te devolverá TODOS los registros
        if (parametros.length > 0) {
            url += `?${parametros.join('&')}`;
        }

        const respuesta = await fetch(url);
        
        if (respuesta.ok) {
            const equipos = await respuesta.json();
            
            // Vaciamos el cuerpo de la tabla (esto limpia la camiseta original o búsquedas previas)
            tabla.innerHTML = ''; 
            
            // Si la consulta no trae ningún registro de la base de datos
            if (equipos.length === 0) {
                tabla.innerHTML = `
                    <tr>
                        <td colspan="5">
                            <div class="empty-state">
                                <div class="icon">🔍</div>
                                <p>No se encontraron equipos con esos criterios.</p>
                            </div>
                        </td>
                    </tr>`;
                return;
            }

            const rol = sessionStorage.getItem('rol');

            // Recorremos los equipos de la BD y pintamos las filas reales
            equipos.forEach(eq => {
                const fila = document.createElement('tr');
                
                let columnas = `
                    <td>${eq.codigo}</td>
                    <td>${eq.descripcion || 'Sin descripción'}</td>
                    <td>${eq.categoria}</td>
                    <td>${eq.grupo}</td>
                `;

                // Columna de acciones regulada por tu rol de sesión
                if (rol === 'admin') {
                    columnas += `
                        <td class="td-actions">
                            <button class="btn btn-outline btn-sm" onclick="abrirEditar('${eq.id_equipo}', '${eq.codigo}', '${eq.descripcion}', '${eq.categoria}', '${eq.grupo}')">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarEquipo('${eq.id_equipo}')">Borrar</button>
                        </td>`;
                } else {
                    columnas += `<td><span class="text-muted" style="font-size: 13px;">Solo lectura</span></td>`;
                }

                fila.innerHTML = columnas;
                tabla.appendChild(fila);
            });
        }
    } catch (error) {
        console.error("Error al buscar:", error);
        tabla.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; padding:20px;">Error al conectar con el servidor</td></tr>`;
    }
}

// FUNCIÓN LIMPIAR: Deja los inputs vacíos y restaura la camiseta desde JS usando tu misma estructura nativa
function limpiarFiltros() {
    document.getElementById('busCategoria').value = '';
    document.getElementById('busGrupo').value = '';

    const tabla = document.getElementById('tabla');
    tabla.innerHTML = `
        <tr>
            <td colspan="5">
                <div class="empty-state">
                    <div class="icon">👕</div>
                    <p>Pulsa Buscar para cargar los equipos</p>
                </div>
            </td>
        </tr>`;
}


// ── 3. OPERACIONES DE GESTIÓN (MODALES Y ACCIONES CRUD) ──

function abrirModalCrear() { document.getElementById('modalCrear').classList.add('open'); }
function cerrarModalCrear() { document.getElementById('modalCrear').classList.remove('open'); }
function abrirModalModificar() { document.getElementById('modalModificar').classList.add('open'); }
function cerrarModalModificar() { document.getElementById('modalModificar').classList.remove('open'); }

// Vincular botones de cerrar modales (tanto la equis '✕' como el botón Cancelar)
document.querySelectorAll('.modal-close, .modal-footer .btn-outline').forEach(boton => {
    boton.addEventListener('click', () => {
        cerrarModalCrear();
        cerrarModalModificar();
    });
});

async function crearEquipo() {
    const codigo = document.getElementById('cCodigo').value;
    const descripcion = document.getElementById('cDescripcion').value;
    const categoria = document.getElementById('cCategoria').value;
    const grupo = document.getElementById('cGrupo').value;

    try {
        const url = `/crearEquipo?codigo=${encodeURIComponent(codigo)}&descripcion=${encodeURIComponent(descripcion)}&categoria=${encodeURIComponent(categoria)}&grupo=${encodeURIComponent(grupo)}`;
        const respuesta = await fetch(url);
        if (respuesta.ok) {
            cerrarModalCrear();
            buscarEquipos(); // Aplica la búsqueda con los filtros actuales
        }
    } catch (error) { console.error(error); }
}

async function eliminarEquipo(id) {
    if (!confirm("¿Seguro que deseas eliminar este equipo?")) return;
    try {
        const respuesta = await fetch(`/eliminarEquipo?id_equipo=${id}`);
        if (respuesta.ok) {
            buscarEquipos();
        }
    } catch (error) { console.error(error); }
}

function abrirEditar(id, codigo, descripcion, categoria, grupo) {
    document.getElementById('mId').value = id;
    document.getElementById('mCodigo').value = codigo;
    document.getElementById('mDescripcion').value = (descripcion === 'null' || descripcion === 'undefined' ? '' : descripcion);
    document.getElementById('mCategoria').value = categoria;
    document.getElementById('mGrupo').value = grupo;
    abrirModalModificar();
}

async function ejecutarModificar() {
    const id = document.getElementById('mId').value;
    const codigo = document.getElementById('mCodigo').value;
    const descripcion = document.getElementById('mDescripcion').value;
    const categoria = document.getElementById('mCategoria').value;
    const grupo = document.getElementById('mGrupo').value;

    try {
        const url = `/modificarEquipo?id_equipo=${id}&codigo=${encodeURIComponent(codigo)}&descripcion=${encodeURIComponent(descripcion)}&categoria=${encodeURIComponent(categoria)}&grupo=${encodeURIComponent(grupo)}`;
        const respuesta = await fetch(url);
        if (respuesta.ok) {
            cerrarModalModificar();
            buscarEquipos();
        }
    } catch (error) { console.error(error); }
}