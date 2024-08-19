const form = document.getElementById('visitor-form');
const tabla = document.querySelector('#registro-tabla tbody');
const modal = document.getElementById('modal');
const closeModalBtn = document.querySelector('.close-btn');
const modalSignaturePad = document.getElementById('signature-pad-large');
const modalContext = modalSignaturePad.getContext('2d');
const limpiarFirmaBtn = document.getElementById('limpiar-firma');
let registros = [];
let currentSignIndex = null;

// Enviar el formulario
form.addEventListener('submit', function (e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const quienEntrego = document.getElementById('quien-entrego').value;
    const quienRecoge = document.getElementById('quien-recoge').value;
    const comentario = document.getElementById('comentario').value;
    const fechaHora = obtenerFechaHora();

    const registro = {
        nombre,
        quienEntrego,
        quienRecoge,
        comentario,
        firma: null,
        fechaHora
    };

    registros.push(registro);
    actualizarTabla();
    form.reset();
});

function actualizarTabla() {
    tabla.innerHTML = '';
    registros.forEach((registro, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${registro.nombre}</td>
            <td>${registro.quienEntrego}</td>
            <td>${registro.quienRecoge}</td>
            <td>${registro.comentario}</td>
            <td>${registro.firma ? '<img src="' + registro.firma + '" alt="Firma" width="100">' : 'Sin Firma'}</td>
            <td>${registro.fechaHora}</td>
            <td>
                <button onclick="abrirModalFirma(${index})">Firma</button>
                <button onclick="editarRegistro(${index})">Editar</button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

function abrirModalFirma(index) {
    currentSignIndex = index;
    modal.style.display = 'block';
    modalContext.clearRect(0, 0, modalSignaturePad.width, modalSignaturePad.height);
    const registro = registros[currentSignIndex];
    if (registro.firma) {
        const img = new Image();
        img.src = registro.firma;
        img.onload = function () {
            modalContext.drawImage(img, 0, 0, modalSignaturePad.width, modalSignaturePad.height);
        };
    }
}

function guardarFirma() {
    const firma = modalSignaturePad.toDataURL();
    registros[currentSignIndex].firma = firma;
    modal.style.display = 'none';
    actualizarTabla();
}

// Limpiar Firma
limpiarFirmaBtn.addEventListener('click', function () {
    modalContext.clearRect(0, 0, modalSignaturePad.width, modalSignaturePad.height);
});

closeModalBtn.addEventListener('click', function () {
    modal.style.display = 'none';
    currentSignIndex = null;
});

window.addEventListener('click', function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
        currentSignIndex = null;
    }
});

function obtenerFechaHora() {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear().toString().slice(-2);
    const horas = String(ahora.getHours() % 12 || 12).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const ampm = ahora.getHours() >= 12 ? 'PM' : 'AM';
    return `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
}

// Borrar Historial
document.getElementById('borrar-historial').addEventListener('click', function () {
    registros = [];
    actualizarTabla();
});

// Descargar screenshot del historial
document.getElementById('descargar-screenshot').addEventListener('click', function () {
    html2canvas(document.querySelector('table')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'registro_historial.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});

function editarRegistro(index) {
    const registro = registros[index];
    document.getElementById('nombre').value = registro.nombre;
    document.getElementById('quien-entrego').value = registro.quienEntrego;
    document.getElementById('quien-recoge').value = registro.quienRecoge;
    document.getElementById('comentario').value = registro.comentario;
    
    // Remover registro temporalmente
    registros.splice(index, 1);
    actualizarTabla();
}

// Lógica para el dibujo de la firma en el canvas
let isDrawing = false;

modalSignaturePad.addEventListener('mousedown', () => isDrawing = true);
modalSignaturePad.addEventListener('mouseup', () => isDrawing = false);
modalSignaturePad.addEventListener('mousemove', drawSignature);
modalSignaturePad.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
});
modalSignaturePad.addEventListener('touchend', () => isDrawing = false);
modalSignaturePad.addEventListener('touchmove', (e) => {
    e.preventDefault();
    drawSignature(e.touches[0]);
});

function drawSignature(event) {
    if (!isDrawing) return;

    const rect = modalSignaturePad.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    modalContext.lineTo(x, y);
    modalContext.stroke();
    modalContext.beginPath();
    modalContext.moveTo(x, y);
}
