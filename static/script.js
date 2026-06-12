
let temporizadoresEquipos = {};

function inicializarPanel() {
    const contenedor = document.getElementById('status-container');

    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                contenedor.innerHTML = '<p class="empty-msg">No hay dispositivos en el registro.</p>';
                limpiarTodosLosTemporizadores();
                return;
            }

            if (!contenedor.querySelector('.grid-container')) {
                let html = '<div class="grid-container">';
                data.forEach(equipo => {
                    const idHtml = `equipo-${equipo.ip.replace(/\./g, '-')}`;
                    html += `<div id="${idHtml}" class="card"></div>`;
                });
                html += '</div>';
                contenedor.innerHTML = html;
            }

            gestionarTemporizadores(data);
        })
        .catch(error => {
            console.error('Error:', error);
            contenedor.innerHTML = '<p class="error-msg">Error de comunicación con el servidor de monitoreo.</p>';
        });
}

function gestionarTemporizadores(equipos) {
    const ipsActuales = equipos.map(e => e.ip);

    Object.keys(temporizadoresEquipos).forEach(ip => {
        if (!ipsActuales.includes(ip)) {
            clearInterval(temporizadoresEquipos[ip]);
            delete temporizadoresEquipos[ip];
        }
    });

    equipos.forEach(equipo => {
        if (!temporizadoresEquipos[equipo.ip]) {
            actualizarEquipoIndividual(equipo.ip);

            // Convertir tasa a milisegundos (si el usuario ingresó '3', pasa a 3000ms)
            const tasaMilisegundos = parseInt(equipo.tasa_actualizacion, 10) * 1000 || 5000;

            temporizadoresEquipos[equipo.ip] = setInterval(() => {
                actualizarEquipoIndividual(equipo.ip);
            }, tasaMilisegundos);
        }
    });
}

function actualizarEquipoIndividual(ip) {
    const idHtml = `equipo-${ip.replace(/\./g, '-')}`;
    const tarjeta = document.getElementById(idHtml);
    if (!tarjeta) return;

    fetch(`/api/status/${ip}`)
        .then(response => response.json())
        .then(equipo => {
            if (equipo.error) return;

            const contenedorTasa = tarjeta.querySelector('.contenedor-tasa-edicion');
            if (contenedorTasa && contenedorTasa.dataset.editando === "true") {
                return; 
            }

            const detallesPrevios = tarjeta.querySelector('.services-list details');
            const estabaAbierto = detallesPrevios ? detallesPrevios.hasAttribute('open') : false;

            const claseEstado = equipo.estado.toLowerCase();
            
            const serviciosPosibles = [
                { nombre: "HTTP", puerto: 80 },
                { nombre: "HTTPS", puerto: 443 },
                { nombre: "RDP", puerto: 3389 },
                { nombre: "SMB", puerto: 445 },
                { nombre: "SSH", puerto: 22 },
                { nombre: "DNS", puerto: 53 },
                { nombre: "RPC", puerto: 135 },
                { nombre: "MySQL", puerto: 3306 },
                { nombre: "FTP", puerto: 21 }
            ];

            let itemsServiciosHtml = '';
            serviciosPosibles.forEach(s => {
                const textoBuscado = `${s.nombre} (${s.puerto})`;
                const estaActivo = equipo.servicios && equipo.servicios.includes(textoBuscado);
                
                const claseServicio = estaActivo ? 'online' : 'offline';
                const textoEstado = estaActivo ? 'activo' : 'no activo';

                itemsServiciosHtml += `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding: 4px 8px; background: rgba(0,0,0,0.02); border-radius: 4px;">
                        <span style="font-family: monospace; font-size: 0.9em; color: #495057;">${s.nombre}:</span>
                        <span class="badge ${claseServicio}" style="font-size: 0.75em; padding: 2px 6px; text-transform: capitalize;">${textoEstado}</span>
                    </div>
                `;
            });

            const desplegableHtml = `
                <div class="services-list" style="margin-top: 14px; border-top: 1px solid #eee; padding-top: 10px; text-align: left;">
                    <details ${estabaAbierto ? 'open' : ''} style="cursor: pointer;">
                        <summary style="font-weight: bold; color: #495057; user-select: none; outline: none; padding: 2px 0;">
                            Puertos
                        </summary>
                        <div style="margin-top: 10px; padding-right: 2px;">
                            ${itemsServiciosHtml}
                        </div>
                    </details>
                </div>
            `;

            tarjeta.className = `card device-${claseEstado}`;
            tarjeta.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;">${equipo.nombre}</h3>
                    <div>
                        <span class="badge ${claseEstado}">${equipo.estado}</span>
                        <button onclick="eliminarEquipo('${equipo.ip}')" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin-left: 10px;" title="Eliminar equipo">Eliminar</button>
                    </div>
                </div>
                <div class="card-body">
                    <p class="ip-text">Dirección IP: <code>${equipo.ip}</code></p>
                    
                    <div class="contenedor-tasa-edicion" data-editando="false" style="display: flex; align-items: center; gap: 8px; margin: 10px 0;">
                        <span class="texto-vista-tasa" style="margin: 0;">Tasa de actualizacion: <code>${equipo.tasa_actualizacion}s</code></span>
                        <input type="number" class="input-edicion-tasa" value="${equipo.tasa_actualizacion}" min="1" style="display: none; width: 70px; padding: 2px 5px; border: 1px solid #ccc; border-radius: 4px; font-family: monospace;">
                        <button onclick="alternarEdicionTasa('${equipo.ip}')" class="btn-accion-tasa" style="background-color: #007bff; color: white; border: none; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 0.85em;">Cambiar</button>
                    </div>

                    ${desplegableHtml}
                </div>
            `;
        })
        .catch(error => console.error(`Error al actualizar el equipo ${ip}:`, error));
}

function alternarEdicionTasa(ip) {
    const idHtml = `equipo-${ip.replace(/\./g, '-')}`;
    const tarjeta = document.getElementById(idHtml);
    if (!tarjeta) return;

    const contenedor = tarjeta.querySelector('.contenedor-tasa-edicion');
    const vistaTexto = contenedor.querySelector('.texto-vista-tasa');
    const inputTasa = contenedor.querySelector('.input-edicion-tasa');
    const botonAccion = contenedor.querySelector('.btn-accion-tasa');

    const estaEditando = contenedor.dataset.editando === "true";

    if (!estaEditando) {
        contenedor.dataset.editando = "true";
        vistaTexto.style.display = "none";
        inputTasa.style.display = "inline-block";
        botonAccion.textContent = "Guardar";
        botonAccion.style.backgroundColor = "#28a745"; 
        inputTasa.focus();
    } else {
        const nuevoValor = inputTasa.value.trim();
        
        if (!nuevoValor || isNaN(nuevoValor) || parseInt(nuevoValor, 10) <= 0) {
            alert("Por favor, introduce un número de segundos válido mayor a 0.");
            return;
        }

        fetch('/api/update_tasa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ip: ip,
                tasa_actualizacion: nuevoValor
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "actualizado") {
                if (temporizadoresEquipos[ip]) {
                    clearInterval(temporizadoresEquipos[ip]);
                    delete temporizadoresEquipos[ip];
                }

                contenedor.dataset.editando = "false";
                
                actualizarEquipoIndividual(ip);
                
                inicializarPanel();
            } else {
                alert("Error al actualizar la tasa en el sistema.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error de comunicación con el servidor.");
        });
    }
}

function eliminarEquipo(ip) {
    if (confirm(`¿Estás seguro de que deseas eliminar el equipo con IP ${ip}?`)) {
        fetch(`/api/delete/${ip.trim()}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (temporizadoresEquipos[ip]) {
                clearInterval(temporizadoresEquipos[ip]);
                delete temporizadoresEquipos[ip];
            }
            
            const idHtml = `equipo-${ip.replace(/\./g, '-')}`;
            const tarjeta = document.getElementById(idHtml);
            if (tarjeta) {
                tarjeta.remove();
            }

            inicializarPanel(); 
        })
        .catch(error => console.error('Error al eliminar:', error));
    }
}

function limpiarTodosLosTemporizadores() {
    Object.keys(temporizadoresEquipos).forEach(ip => clearInterval(temporizadoresEquipos[ip]));
    temporizadoresEquipos = {};
}

inicializarPanel();
setInterval(inicializarPanel, 10000);