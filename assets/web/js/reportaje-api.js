/*
|--------------------------------------------------------------------------
| Reportaje individual - Diálogo y Desarrollo Perú
|--------------------------------------------------------------------------
| Obtiene los datos desde api/reportaje.php y los muestra en reportaje.html.
|--------------------------------------------------------------------------
*/

document.addEventListener('DOMContentLoaded', iniciarReportaje);

async function iniciarReportaje() {
    const estado = document.getElementById('estado-reportaje');
    const contenido = document.getElementById('contenido-reportaje');

    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get('id');

    if (!id || !/^[1-9]\d*$/.test(id)) {
        mostrarError('No se ha indicado un identificador de reportaje válido.');
        return;
    }

    try {
        const respuesta = await fetch(
            `https://3.135.217.244/api/reportaje.php?id=${encodeURIComponent(id)}`
        );

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.success) {
            throw new Error(
                datos.error || 'No se pudo cargar el reportaje.'
            );
        }

        mostrarReportaje(datos);

        estado.hidden = true;
        contenido.hidden = false;

    } catch (error) {
        console.error('Error al cargar el reportaje:', error);

        mostrarError(
            error.message || 'Ocurrió un error al cargar el reportaje.'
        );
    }
}

/*
|--------------------------------------------------------------------------
| Mostrar el reportaje principal
|--------------------------------------------------------------------------
*/

function mostrarReportaje(datos) {
    const reportaje = datos.reportaje;

    document.title =
        `${reportaje.titulo} - Diálogo y Desarrollo Perú`;

    document.getElementById('titulo-reportaje').textContent =
        reportaje.titulo;

    document.getElementById('fecha-reportaje').textContent =
        formatearFecha(reportaje.fecha_publicacion);

    document.getElementById('autor-reportaje').textContent =
        reportaje.autor_texto || 'Redacción';

    // Imagen principal
    const foto = document.getElementById('foto-principal');

    foto.src = obtenerRutaImagen(reportaje.foto_principal);
    foto.alt = reportaje.titulo;

    foto.onerror = function () {
        this.onerror = null;
        this.src = '../assets/web/img/placeholder.jpg';
    };

    // Resumen en negrita, cursiva y entre comillas.
    const resumen = document.getElementById('resumen-reportaje');

    resumen.replaceChildren();

    if (reportaje.resumen_corto) {
        const parrafo = document.createElement('p');
        parrafo.className = 'text-dark fw-bold fs-2 mb-0';
        parrafo.style.fontSize = '1.5rem';
        const negrita = document.createElement('strong');
        const cursiva = document.createElement('em');
        cursiva.className = 'fw-bold';
        cursiva.textContent = `“${reportaje.resumen_corto}”`;

        negrita.appendChild(cursiva);
        parrafo.appendChild(negrita);
        resumen.appendChild(parrafo);

        resumen.hidden = false;
    } else {
        resumen.hidden = true;
    }

    // Desarrollo: conserva los saltos de línea sin interpretar HTML.
    const desarrollo = document.getElementById('desarrollo-reportaje');

    desarrollo.replaceChildren();

    String(reportaje.desarrollo || '')
        .split(/\r?\n/)
        .forEach(function (parrafo) {
            if (parrafo.trim() === '') {
                return;
            }

            const elemento = document.createElement('p');
            elemento.textContent = parrafo;
            elemento.classList.add('mb-3');

            desarrollo.appendChild(elemento);
        });

    // Galería de fotografías
    mostrarGaleria(datos.fotos || []);

    // PDF adjunto
    mostrarPDF(reportaje.pdf_adjunto);

    // Barra lateral
    mostrarUltimosReportajes(datos.ultimos_reportajes || []);
    mostrarArchivos(datos.archivos || []);
}

/*
|--------------------------------------------------------------------------
| Fotografías
|--------------------------------------------------------------------------
*/

function mostrarGaleria(fotos) {
    const seccion = document.getElementById('seccion-galeria');
    const galeria = document.getElementById('galeria-reportaje');

    galeria.replaceChildren();

    if (!fotos.length) {
        seccion.hidden = true;
        return;
    }

    fotos.forEach(function (foto) {
        const columna = document.createElement('div');
        columna.className = 'col-md-4 mb-3';

        const contenedor = document.createElement('span');
        contenedor.className = 'reportaje-galeria-item';

        const imagen = document.createElement('img');
        imagen.className = 'img-fluid';
        imagen.src = obtenerRutaImagen(foto.url_foto);
        imagen.alt = foto.descripcion || 'Fotografía del reportaje';
        imagen.loading = 'lazy';

        // Si falla la fotografía, mostrar la imagen predeterminada.
        imagen.onerror = function () {
            this.onerror = null;
            this.src = '../assets/web/img/placeholder.jpg';
        };

        contenedor.appendChild(imagen);
        columna.appendChild(contenedor);

        if (foto.descripcion) {
            const descripcion = document.createElement('small');
            descripcion.className = 'd-block text-muted mt-1';
            descripcion.textContent = foto.descripcion;
            columna.appendChild(descripcion);
        }

        galeria.appendChild(columna);
    });

    seccion.hidden = false;
}

/*
|--------------------------------------------------------------------------
| Documento PDF
|--------------------------------------------------------------------------
*/

function mostrarPDF(pdf) {
    const seccion = document.getElementById('seccion-pdf');
    const enlace = document.getElementById('enlace-pdf');

    if (!pdf) {
        seccion.hidden = true;
        return;
    }

    // Los documentos PDF se guardan en la carpeta boletines/.
    enlace.href = '../boletines/' + encodeURIComponent(pdf);
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';

    seccion.hidden = false;
}

/*
|--------------------------------------------------------------------------
| Últimos reportajes
|--------------------------------------------------------------------------
*/

function mostrarUltimosReportajes(reportajes) {
    const lista = document.getElementById('ultimos-reportajes');

    lista.replaceChildren();

    if (!reportajes.length) {
        agregarMensaje(lista, 'No hay otros reportajes publicados.');
        return;
    }

    reportajes.forEach(function (reportaje) {
        const elemento = document.createElement('li');
        elemento.className = 'mb-3';

        const enlace = document.createElement('a');
        enlace.href =
            `reportaje.html?id=${encodeURIComponent(reportaje.id)}`;

        enlace.textContent = reportaje.titulo;

        const fecha = document.createElement('small');
        fecha.className = 'd-block mt-1 text-muted';
        fecha.textContent = formatearFecha(reportaje.fecha_publicacion);

        elemento.appendChild(enlace);
        elemento.appendChild(fecha);

        lista.appendChild(elemento);
    });
}

/*
|--------------------------------------------------------------------------
| Archivos por mes
|--------------------------------------------------------------------------
*/

function mostrarArchivos(archivos) {
    const lista = document.getElementById('archivos-reportajes');

    lista.replaceChildren();

    if (!archivos.length) {
        agregarMensaje(lista, 'No hay archivos disponibles.');
        return;
    }

    archivos.forEach(function (archivo) {
        const elemento = document.createElement('li');
        elemento.className = 'mb-2';

        const enlace = document.createElement('a');

        enlace.href =
            `reportajes.html?periodo=${encodeURIComponent(archivo.periodo)}`;

        enlace.textContent =
            `${formatearPeriodo(archivo.periodo)} (${archivo.total})`;

        elemento.appendChild(enlace);
        lista.appendChild(elemento);
    });
}

/*
|--------------------------------------------------------------------------
| Rutas de imágenes y documentos
|--------------------------------------------------------------------------
*/

function obtenerRutaImagen(archivo) {
    if (!archivo) {
        return '../assets/web/img/placeholder.jpg';
    }

    // Los archivos del sistema se guardan en assets/web/img/.
    return '../assets/web/img/' + encodeURIComponent(archivo);
}

/*
|--------------------------------------------------------------------------
| Formato de fechas en español
|--------------------------------------------------------------------------
*/

function formatearFecha(fecha) {
    if (!fecha) {
        return '';
    }

    const coincidencia = String(fecha).match(
        /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (!coincidencia) {
        return fecha;
    }

    const fechaLocal = new Date(
        Number(coincidencia[1]),
        Number(coincidencia[2]) - 1,
        Number(coincidencia[3])
    );

    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(fechaLocal);
}

function formatearPeriodo(periodo) {
    const coincidencia = String(periodo).match(
        /^(\d{4})-(\d{2})$/
    );

    if (!coincidencia) {
        return periodo;
    }

    const fecha = new Date(
        Number(coincidencia[1]),
        Number(coincidencia[2]) - 1,
        1
    );

    return new Intl.DateTimeFormat('es-PE', {
        month: 'long',
        year: 'numeric'
    }).format(fecha);
}

/*
|--------------------------------------------------------------------------
| Mensajes y errores
|--------------------------------------------------------------------------
*/

function agregarMensaje(lista, mensaje) {
    const elemento = document.createElement('li');
    elemento.textContent = mensaje;
    lista.appendChild(elemento);
}

function mostrarError(mensaje) {
    const estado = document.getElementById('estado-reportaje');

    estado.replaceChildren();

    const texto = document.createElement('p');
    texto.textContent = mensaje;

    const enlace = document.createElement('a');
    enlace.href = 'reportajes.html';
    enlace.className = 'btn btn-primary mt-3';
    enlace.textContent = 'Volver a reportajes';

    estado.appendChild(texto);
    estado.appendChild(enlace);

    estado.hidden = false;
}
