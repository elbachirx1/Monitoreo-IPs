function actualizarPanel() {
    const contenedor = document.getElementById('status-container');

    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                contenedor.innerHTML = '<p class="empty-msg">No hay dispositivos en el registro.</p>';
                return;
            }

            let html = '<div class="grid-container">';
            data.forEach(equipo => {
                const claseEstado = equipo.estado.toLowerCase();
                
                let serviciosHtml = '';
                if (equipo.estado === "Online" && equipo.servicios.length > 0) {
                    serviciosHtml = `<div class="services-list">
                                        <small>Servicios: ${equipo.servicios.join(', ')}</small>
                                     </div>`;
                }

                html += `
                    <div class="card device-${claseEstado}">
                        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                            <h3 style="margin: 0;">${equipo.nombre}</h3>
                            <div>
                                <span class="badge ${claseEstado}">${equipo.estado}</span>
                                <button onclick="eliminarEquipo('${equipo.ip}')" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin-left: 10px;" title="Eliminar equipo">Eliminar</button>
                            </div>
                        </div>
                        <div class="card-body">
                            <p class="ip-text">Dirección IP: <code>${equipo.ip}</code></p>
                            ${serviciosHtml}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            contenedor.innerHTML = html;
        })
        .catch(error => {
            console.error('Error:', error);
            contenedor.innerHTML = '<p class="error-msg">Error de comunicación con el servidor de monitoreo.</p>';
        });
}

function eliminarEquipo(ip) {
    if (confirm(`¿Estás seguro de que deseas eliminar el equipo con IP ${ip}?`)) {
        fetch(`/api/delete/${ip}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            actualizarPanel(); 
        })
        .catch(error => console.error('Error al eliminar:', error));
    }
}

actualizarPanel();
setInterval(actualizarPanel, 2000);