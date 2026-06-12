

import os
import sys
import subprocess

def in_venv():
    return sys.prefix != sys.base_prefix

 
if not in_venv():  # si no estamos en la burbuja se crea y se entra en ella
    print("iniciando configuración automática del proyecto...")


    if not os.path.exists("venv"):  # crea la carpeta venv
        subprocess.check_call([sys.executable, "-m", "venv", "venv"])

    base_dir = os.path.abspath(os.path.dirname(__file__)) # obtener ruta absoluta   
    
    if os.name == 'nt':
        venv_python = os.path.join(base_dir, "venv", "Scripts", "python.exe")
    else:
        venv_python = os.path.join(base_dir, "venv", "bin", "python")
        
    # instala las dependencias leyendo el pyproject.toml
    print("instalando librerías necesarias...")
    subprocess.check_call([venv_python, "-m", "pip", "install", "-q", "Flask", "requests"])
    
    print("todo listo, arrancando el servidor web...")
    script_actual = os.path.abspath(__file__) 
    subprocess.run([venv_python, script_actual] + sys.argv[1:])
    sys.exit(0)








import json
import socket
import webbrowser
from threading import Timer
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
ARCHIVO = 'datos.json'

def leer_datos():
    if not os.path.exists(ARCHIVO):
        return []
    with open(ARCHIVO, 'r') as f:
        try:
            return json.load(f)
        except:
            return []

def obtener_servicios(ip):
    servicios_a_probar = {
        80: "HTTP", 443: "HTTPS", 3389: "RDP", 
        445: "SMB", 22: "SSH", 53: "DNS", 
        135: "RPC", 3306: "MySQL", 21: "FTP"
    }
    encontrados = []
    for puerto, nombre in servicios_a_probar.items():
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.2) # Tiempo rápido para no bloquear la web
        if sock.connect_ex((ip, puerto)) == 0:
            encontrados.append(f"{nombre} ({puerto})")
        sock.close()
    return encontrados

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/panel')
def panel():
    return render_template('panel.html')



@app.route('/add', methods=['POST'])
def add_device():
    nombre = request.form.get('nombre')
    ip = request.form.get('ip')
    tasa_actualizacion = request.form.get('tasa_actualizacion')
    
    datos = leer_datos()
    
    for equipo in datos:
        if equipo['ip'] == ip:
            return render_template('index.html', mensaje=f"El equipo con IP {ip} ya está registrado. Revisa el Panel.")
  
    if os.name == 'nt':
        comando = ['ping', '-n', '1', '-w', '1000', ip]
    else:
        comando = ['ping', '-c', '1', '-w', '1', ip]
        
    res = subprocess.run(comando, stdout=subprocess.PIPE)
    estado_inicial = "Online" if res.returncode == 0 else "Offline"
    
    datos.append({"nombre": nombre,
                  "ip": ip,
                  "estado": estado_inicial,
                  "tasa_actualizacion": tasa_actualizacion,
                  "servicios": []})
    
    with open(ARCHIVO, 'w') as f:
        json.dump(datos, f, indent=4)
        
    return render_template('index.html', mensaje=f"Equipo '{nombre}' añadido correctamente.")


@app.route('/api/delete/<ip>', methods=['DELETE'])
def delete_device(ip):
    datos = leer_datos()
    ip_a_borrar = ip.strip()
    
    datos_filtrados = [equipo for equipo in datos if equipo['ip'].strip() != ip_a_borrar]
    
    with open(ARCHIVO, 'w') as f:
        json.dump(datos_filtrados, f, indent=4)
        
    return jsonify({"status": "eliminado"})


@app.route('/api/status')
def get_status():
    equipos = leer_datos()
    
    for equipo in equipos:
        if os.name == 'nt':
            comando = ['ping', '-n', '1', '-w', '1000', equipo['ip']]
        else:
            comando = ['ping', '-c', '1', '-w', '1', equipo['ip']]
            
        res = subprocess.run(comando, stdout=subprocess.PIPE)
        
        if res.returncode == 0:
            equipo['estado'] = "Online"
            # solo si está online, buscamos servicios
            equipo['servicios'] = obtener_servicios(equipo['ip'])
            
        else:
            equipo['estado'] = "Offline"
            equipo['servicios'] = [] # vacío si está Offline

    with open(ARCHIVO, 'w') as f:
        json.dump(equipos, f, indent=4)
    
    return jsonify(equipos)


@app.route('/api/status/<ip>')
def get_single_status(ip):
    equipos = leer_datos()
    equipo = next((e for e in equipos if e['ip'] == ip), None)
    
    if not equipo:
        return jsonify({"error": "Equipo no encontrado"}), 404

    if os.name == 'nt':
        comando = ['ping', '-n', '1', '-w', '1000', equipo['ip']]
    else:
        comando = ['ping', '-c', '1', '-w', '1', equipo['ip']]
        
    res = subprocess.run(comando, stdout=subprocess.PIPE)
    
    if res.returncode == 0:
        equipo['estado'] = "Online"
        equipo['servicios'] = obtener_servicios(equipo['ip'])
    else:
        equipo['estado'] = "Offline"
        equipo['servicios'] = []

    with open(ARCHIVO, 'w') as f:
        json.dump(equipos, f, indent=4)
        
    return jsonify(equipo)

@app.route('/api/update_tasa', methods=['POST'])
def update_tasa():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
        
    ip_objetivo = data.get('ip', '').strip()
    nueva_tasa = data.get('tasa_actualizacion', '').strip()
    
    datos = leer_datos()
    modificado = False
    
    for equipo in datos:
        if equipo['ip'].strip() == ip_objetivo:
            equipo['tasa_actualizacion'] = nueva_tasa
            modificado = True
            break
            
    if modificado:
        with open(ARCHIVO, 'w') as f:
            json.dump(datos, f, indent=4)
        return jsonify({"status": "actualizado", "nueva_tasa": nueva_tasa})
        
    return jsonify({"error": "Equipo no encontrado"}), 404


def abrir_navegador():
    webbrowser.open_new('http://127.0.0.1:5000')
    
if __name__ == '__main__':
    Timer(1.5, abrir_navegador).start()
    app.run(host='0.0.0.0', port=5000, debug=False)