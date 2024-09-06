let registros = JSON.parse(localStorage.getItem('registros')) || [];
let indiceEdicion = null;

document.getElementById('registro-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const nuevoRegistro = {
        nombre: form.nombre.value,
        quienEntrego: form.quienEntrego.value,
        quienRecoge: form.quienRecoge.value,
        comentario: form.comentario.value,
        foto: '',
        fechaHora: new Date().toLocaleString()
    };

    registros.unshift(nuevoRegistro); // Añadir al principio del array
    actualizarTabla();
    form.reset();
});

function actualizarTabla() {
    const tabla = document.querySelector('#registro-tabla tbody');
    tabla.innerHTML = '';

    registros.forEach((registro, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${registro.nombre || ''}</td>
            <td>${registro.quienEntrego || ''}</td>
            <td>${registro.quienRecoge || ''}</td>
            <td>${registro.comentario || ''}</td>
            <td>
                ${registro.foto ? '<img src="' + registro.foto + '" alt="Foto" width="100">' : 'Sin Foto'}
            </td>
            <td>${registro.fechaHora || ''}</td>
            <td>
                <button onclick="abrirModalFoto(${index})">Tomar Foto</button>
                <button onclick="editarRegistro(${index})">Editar</button>
            </td>
        `;
        tabla.appendChild(fila);
    });

    localStorage.setItem('registros', JSON.stringify(registros));
}

function abrirModalFoto(index) {
    indiceEdicion = index;
    const modal = document.getElementById('modal-foto');
    modal.style.display = 'block';

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.getElementById('video');
            video.srcObject = stream;
            video.play();
        })
        .catch(err => {
            console.error('Error al acceder a la cámara: ', err);
        });
}

document.getElementById('boton-capturar').addEventListener('click', function() {
    const canvas = document.getElementById('canvas');
    const video = document.getElementById('video');
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/png');
    registros[indiceEdicion].foto = dataURL;
    actualizarTabla();
    cerrarModalFoto();
});

function cerrarModalFoto() {
    const modal = document.getElementById('modal-foto');
    modal.style.display = 'none';

    const video = document.getElementById('video');
    const stream = video.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
}

function editarRegistro(index) {
    const registro = registros[index];
    const form = document.getElementById('registro-form');

    form.nombre.value = registro.nombre;
    form.quienEntrego.value = registro.quienEntrego;
    form.quienRecoge.value = registro.quienRecoge;
    form.comentario.value = registro.comentario;

    registros.splice(index, 1);
    actualizarTabla();
}

document.getElementById('borrar-historial').addEventListener('click', function() {
    registros = [];
    actualizarTabla();
    localStorage.removeItem('registros');
});

document.getElementById('descargar-historial').addEventListener('click', function() {
    // Descargar screenshot del historial
    html2canvas(document.querySelector('#registro-tabla')).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = 'historial.png';
        link.click();
    });

    // Descargar todas las fotos de los registros
    registros.forEach((registro, index) => {
        if (registro.foto) {
            const link = document.createElement('a');
            link.href = registro.foto;
            link.download = `foto_${index + 1}.png`;
            link.click();
        }
    });
});

actualizarTabla();
