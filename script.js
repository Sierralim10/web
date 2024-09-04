let registros = [];
let currentSignIndex = -1;

document.getElementById('visitor-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const quienEntrego = document.getElementById('quien-entrego').value;
    const quienRecoge = document.getElementById('quien-recoge').value;
    const comentario = document.getElementById('comentario').value;
    const fechaHora = obtenerFechaHora();

    if (currentSignIndex !== -1) {
        // Actualizar registro existente
        registros[currentSignIndex] = {
            nombre,
            quienEntrego,
            quienRecoge,
            comentario,
            foto: registros[currentSignIndex].foto,
            fechaHora
        };
        currentSignIndex = -1;
    } else {
        // Crear nuevo registro
        const registro = {
            nombre,
            quienEntrego,
            quienRecoge,
            comentario,
            foto: null,
            fechaHora
        };

        registros.push(registro);
    }

    actualizarTabla();
    this.reset();
});

function obtenerFechaHora() {
    const now = new Date();
    const dia = String(now.getDate()).padStart(2, '0');
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const anio = now.getFullYear().toString().slice(-2);
    const horas = String(now.getHours()).padStart(2, '0');
    const minutos = String(now.getMinutes()).padStart(2, '0');
    const segundos = String(now.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
}

function actualizarTabla() {
    const tabla = document.querySelector('#registro-tabla tbody');
    tabla.innerHTML = '';
    registros.forEach((registro, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${registro.nombre}</td>
            <td>${registro.quienEntrego}</td>
            <td>${registro.quienRecoge}</td>
            <td>${registro.comentario}</td>
            <td>${registro.foto ? '<img src="' + registro.foto + '" alt="Foto" width="100">' : 'Sin Foto'}</td>
            <td>${registro.fechaHora}</td>
            <td>
                <button onclick="abrirModalFoto(${index})">Tomar Foto</button>
                <button onclick="editarRegistro(${index})">Editar</button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

function abrirModalFoto(index) {
    const modal = document.getElementById('photo-modal');
    const video = document.getElementById('video');
    currentSignIndex = index;
    modal.style.display = 'block';

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error("Error accessing the camera: ", error);
        });
}

function guardarFoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('photo-canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    registros[currentSignIndex].foto = canvas.toDataURL('image/png');
    cerrarModalFoto();
    actualizarTabla();
}

function cerrarModalFoto() {
    const modal = document.getElementById('photo-modal');
    const video = document.getElementById('video');
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => track.stop());
    video.srcObject = null;
    modal.style.display = 'none';
}

document.getElementById('clear-photo').addEventListener('click', function () {
    const canvas = document.getElementById('photo-canvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    registros[currentSignIndex].foto = null;
    actualizarTabla();
});

document.getElementById('capture-photo').addEventListener('click', guardarFoto);

document.querySelector('.modal .close-btn').addEventListener('click', cerrarModalFoto);

document.getElementById('borrar-historial').addEventListener('click', function () {
    registros = [];
    actualizarTabla();
});

document.getElementById('descargar-screenshot').addEventListener('click', function () {
    html2canvas(document.querySelector('.container')).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'historial.png';
        link.click();
    });

    // Descarga las fotos
    registros.forEach((registro, index) => {
        if (registro.foto) {
            const link = document.createElement('a');
            link.href = registro.foto;
            link.download = `foto_${index}_${registro.fechaHora}.png`;
            link.click();
        }
    });
});

function editarRegistro(index) {
    const registro = registros[index];
    document.getElementById('nombre').value = registro.nombre;
    document.getElementById('quien-entrego').value = registro.quienEntrego;
    document.getElementById('quien-recoge').value = registro.quienRecoge;
    document.getElementById('comentario').value = registro.comentario;

    currentSignIndex = index;
}
