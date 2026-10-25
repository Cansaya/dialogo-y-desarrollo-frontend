(function () {
    'use strict';

    const API_URL = '../api/reportajes.php';
    const RUTA_IMAGENES = '../assets/web/img/';

    const lista = document.getElementById('lista-reportajes');
    const paginacion = document.getElementById('paginacion-reportajes');

    if (!lista || !paginacion) {
        return;
    }

    function escaparHTML(valor) {
        return String(valor ?? '').replace(/[&<>"']/g, function (caracter) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[caracter];
        });
    }

    function formatearFecha(fecha) {
        if (!fecha) {
            return '';
        }

        const partes = fecha.split('-');

        if (partes.length !== 3) {
            return escaparHTML(fecha);
        }

        const fechaLocal = new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );

        return fechaLocal.toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    function crearTarjeta(reportaje) {
        const id = Number(reportaje.id);
        const titulo = escaparHTML(reportaje.titulo);
        const fecha = formatearFecha(reportaje.fecha_publicacion);

        const archivo = reportaje.foto_principal;
        const nombreImagen = archivo && archivo.trim()
            ? archivo
            : 'placeholder.jpg';

        const imagen = RUTA_IMAGENES + encodeURIComponent(nombreImagen);
        const enlace = 'reportaje.html?id=' + encodeURIComponent(id);

        return `
            <div class="col-lg-4 col-md-6 grids5-info mt-5">
                <a href="${enlace}" class="d-block foto-recorte">
                    <img
                        src="${imagen}"
                        alt="${titulo}"
                        class="img-fluid"
                        loading="lazy"
                        onerror="this.onerror=null;this.src='../assets/web/img/placeholder.jpg';"
                    >
                </a>

                <div class="blog-info">
                    <h5>${fecha}</h5>

                    <h4>
                        <a href="${enlace}" class="d-block">${titulo}</a>
                    </h4>

                    <a href="${enlace}" class="btn mt-4 p-0">
                        Leer <span class="fa fa-arrow-right"></span>
                    </a>
                </div>
            </div>
        `;
    }

    function crearPaginacion(datos) {
        const paginaActual = datos.pagina_actual;
        const totalPaginas = datos.total_paginas;

        if (totalPaginas <= 1) {
            paginacion.innerHTML = '';
            return;
        }

        let html = '<ul style="display:flex;justify-content:center;gap:5px;flex-wrap:wrap;padding-left:0;">';

        if (datos.tiene_anterior) {
            html += `
                <li class="prev">
                    <a href="?pagina=${paginaActual - 1}" data-pagina="${paginaActual - 1}">
                        Ant.
                    </a>
                </li>
            `;
        }

        for (let pagina = 1; pagina <= totalPaginas; pagina++) {
            html += `
                <li>
                    <a
                        href="?pagina=${pagina}"
                        data-pagina="${pagina}"
                        class="${pagina === paginaActual ? 'active' : ''}"
                        ${pagina === paginaActual ? 'aria-current="page"' : ''}
                    >${pagina}</a>
                </li>
            `;
        }

        if (datos.tiene_siguiente) {
            html += `
                <li class="next">
                    <a href="?pagina=${paginaActual + 1}" data-pagina="${paginaActual + 1}">
                        Sig.
                    </a>
                </li>
            `;
        }

        html += '</ul>';

        paginacion.innerHTML = html;
    }

    async function cargarReportajes(pagina = 1, actualizarURL = true) {
        lista.innerHTML = `
            <div class="col-12 text-center py-4">
                <p>Cargando reportajes...</p>
            </div>
        `;

        paginacion.innerHTML = '';

        try {
            const respuesta = await fetch(
                API_URL + '?pagina=' + encodeURIComponent(pagina)
            );

            if (!respuesta.ok) {
                throw new Error('La API respondió con estado ' + respuesta.status);
            }

            const datos = await respuesta.json();

            if (!datos.success) {
                throw new Error(datos.error || 'No se pudieron cargar los reportajes.');
            }

            if (!Array.isArray(datos.reportajes) || datos.reportajes.length === 0) {
                lista.innerHTML = `
                    <div class="col-12 text-center py-4">
                        <p>Todavía no hay reportajes cargados.</p>
                    </div>
                `;
                return;
            }

            lista.innerHTML = datos.reportajes
                .map(crearTarjeta)
                .join('');

            crearPaginacion(datos.paginacion);

            if (actualizarURL) {
                const nuevaURL = new URL(window.location.href);
                nuevaURL.searchParams.set('pagina', datos.paginacion.pagina_actual);
                window.history.replaceState({}, '', nuevaURL);
            }

        } catch (error) {
            console.error('Error al cargar los reportajes:', error);

            lista.innerHTML = `
                <div class="col-12 text-center py-4">
                    <p>No se pudieron cargar los reportajes.</p>
                    <button type="button" class="btn btn-primary" id="reintentar-reportajes">
                        Intentar nuevamente
                    </button>
                </div>
            `;

            const reintentar = document.getElementById('reintentar-reportajes');

            if (reintentar) {
                reintentar.addEventListener('click', function () {
                    cargarReportajes(pagina, false);
                });
            }
        }
    }

    paginacion.addEventListener('click', function (evento) {
        const enlace = evento.target.closest('a[data-pagina]');

        if (!enlace) {
            return;
        }

        evento.preventDefault();

        const pagina = Number(enlace.dataset.pagina);

        if (Number.isInteger(pagina) && pagina >= 1) {
            cargarReportajes(pagina);
        }
    });

    const parametros = new URLSearchParams(window.location.search);
    const paginaInicial = Math.max(1, Number(parametros.get('pagina')) || 1);

    cargarReportajes(paginaInicial, false);
})();
