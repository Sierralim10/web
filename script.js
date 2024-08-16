const canvas = document.getElementById('signature-pad');
const context = canvas.getContext('2d');
const form = document.getElementById('visitor-form');
const tabla = document.querySelector('#registro-tabla tbody');
let registros = [];
let editingIndex = null;

// Configuración del canvas
canvas.width = 300;
canvas.height = 150;

// Variable para controlar el dibujo
let drawing = false;

// Función para comenzar el dibujo
function startDrawing(e) {
    drawing = true;
    const { offsetX, offsetY } = getOffset(e);
    context.beginPath();
    context.moveTo(offsetX, offsetY);
}

// Función para dibujar en el canvas
function draw(e) {
    if (drawing) {
        const { offsetX, offsetY } = getOffset(e);
        context.lineTo(offsetX, offsetY);
        context.stroke();
    }
}

// Función para finalizar el dibujo
function stopDrawing() {
    drawing = false;
}

// Función para obtener las coordenadas del evento (táctil o ratón)
function getOffset(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
        // Para eventos táctiles
        return {
            offsetX: e.touches[0].clientX - rect.left,
            offsetY: e.touches[0].clientY - rect.top
        };
    } else {
        // Para eventos de ratón
        return {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        };
    }
}

// Agregar eventos para ratón
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);

// Agregar eventos para táctiles
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

// Limpiar el canvas
document.getElementById('clear-signature').addEventListener('click', function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
});

// Obtener la fecha y hora actual en formato DD/MM/AA hh:mm pm
function obtenerFechaHora() {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0'); // Meses de 0-11
    const anio = ahora.getFullYear().toString().slice(-2); // Dos últimos dígitos del año
    const horas = String(ahora.getHours() % 12 || 12).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const ampm = ahora.getHours() >= 12 ? 'PM' : 'AM';
    
    return `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
}

// Enviar el formulario
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const quienEntrego = document.getElementById('quien-entrego').value;
    const quienRecoge = document.getElementById('quien-recoge').value;
    const comentario = document.getElementById('comentario').value;
    const fechaHora = obtenerFechaHora(); // Fecha y hora actual

    // Obtener la firma como imagen en base64
    const firma = canvas.toDataURL();

    const registro = {
        nombre,
        quienEntrego,
        quienRecoge,
        comentario,
        firma,
        fechaHora
    };

    if (editingIndex !== null) {
        registros[editingIndex] = registro;
        editingIndex = null;
    } else {
        registros.push(registro);
    }

    actualizarTabla();

    form.reset();
    context.clearRect(0, 0, canvas.width, canvas.height);  // Limpiamos el canvas después de guardar el registro
});

function actualizarTabla() {
    tabla.innerHTML = ''; // Limpiar tabla

    registros.forEach((registro, index) => {
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${registro.nombre}</td>
            <td>${registro.quienEntrego}</td>
            <td>${registro.quienRecoge}</td>
            <td>${registro.comentario}</td>
            <td><img src="${registro.firma}" alt="Firma" width="100"></td>
            <td>${registro.fechaHora}</td> <!-- Mostrar fecha y hora -->
            <td>
                <button onclick="editarRegistro(${index})">Editar</button>
            </td>
        `;

        tabla.appendChild(fila);
    });
}

// Editar registro
function editarRegistro(index) {
    const registro = registros[index];
    
    document.getElementById('nombre').value = registro.nombre;
    document.getElementById('quien-entrego').value = registro.quienEntrego;
    document.getElementById('quien-recoge').value = registro.quienRecoge;
    document.getElementById('comentario').value = registro.comentario;

    const img = new Image();
    img.src = registro.firma;
    img.onload = function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    editingIndex = index;
}

// Borrar Historial
document.getElementById('borrar-historial').addEventListener('click', function () {
    registros = [];
    actualizarTabla();
});

// Descargar historial como imagen
document.getElementById('descargar-excel').addEventListener('click', function () {
    html2canvas(document.querySelector('#registro-tabla')).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `historial_${obtenerFechaHora().replace(/\s+/g, '_').replace(/\//g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

