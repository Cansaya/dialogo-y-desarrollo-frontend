/*
 * DDP Noticias
 * Frontend estático
 *
 * Arquitectura:
 * index.html
 *    -> fetch()
 *    -> api/home.php
 *    -> PDO
 *    -> Aiven MySQL
 *
 * IMPORTANTE:
 * Para la prueba local usamos XAMPP.
 * Cuando pasemos a AWS, solamente cambiaremos API_URL.
 */

const API_URL = 'https://3.135.217.244/api/home.php';

const IMG_BASE = 'assets/web/img/';
const REPORTAJE_BASE = 'paginas/reportaje.html?id=';
const BOLETIN_BASE = 'boletines/';
const PAGINA_BOLETINES = 'paginas/boletines.html';

document.addEventListener('DOMContentLoaded', cargarInicio);

async function cargarInicio() {
    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error(`HTTP ${respuesta.status}`);
        }

        const data = await respuesta.json();

        if (!data.success) {
            throw new Error(data.message || 'La API devolvió un error.');
        }

        renderDestacado(data.destacado);
        renderReportajes(data.reportajes || []);
        renderNoticias(data.noticias || []);
        renderBoletin(data.boletin);
        renderPodcasts(data.podcasts || []);
        renderEspeciales(data.especiales || []);

        inicializarComponentes();

        console.log('DDP: datos cargados correctamente desde la API.');

    } catch (error) {
        console.error('DDP: error al consumir la API:', error);
        mostrarError('No se pudo cargar la información desde el servidor.');
    }
}

/* ------------------------- Helpers ------------------------- */

function escapeHTML(valor) {
    if (valor === null || valor === undefined) return '';

    return String(valor)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function imagen(nombre) {
    return IMG_BASE + encodeURIComponent(nombre || 'placeholder.jpg');
}

function fechaLarga(fecha) {
    if (!fecha) return '';

    const d = new Date(fecha.replace(' ', 'T'));

    if (Number.isNaN(d.getTime())) return fecha;

    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(d);
}

function fechaBoletin(fecha) {
    if (!fecha) return '';

    const d = new Date(fecha.replace(' ', 'T'));

    if (Number.isNaN(d.getTime())) return fecha;

    return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: 'long'
    }).format(d);
}

function linkReportaje(id) {
    return REPORTAJE_BASE + encodeURIComponent(id);
}

/* ------------------------- Destacado ------------------------- */

function renderDestacado(item) {
    if (!item) {
        document.getElementById('destacado-fecha').textContent = '';
        document.getElementById('destacado-titulo').textContent =
            'Aún no hay un reportaje destacado';
        document.getElementById('destacado-resumen').textContent =
            'Marca un reportaje como destacado desde el panel de administración.';
        return;
    }

    const url = linkReportaje(item.id);

    document.getElementById('destacado-enlace').href = url;
    document.getElementById('destacado-imagen').src =
        imagen(item.foto_principal);

    document.getElementById('destacado-fecha').textContent =
        fechaLarga(item.fecha_publicacion);

    document.getElementById('destacado-titulo').textContent =
        item.titulo || '';

    document.getElementById('destacado-titulo').href = url;

    document.getElementById('destacado-resumen').textContent =
        item.resumen_corto || '';

    document.getElementById('destacado-leer').href = url;
}

/* ------------------------- Reportajes ------------------------- */

function renderReportajes(items) {
    const contenedor = document.getElementById('lista-reportajes');

    if (!items.length) {
        contenedor.innerHTML =
            '<div class="col-12 text-center py-4"><p>Todavía no hay reportajes cargados.</p></div>';
        return;
    }

    contenedor.innerHTML = items.map((r, index) => {
        const url = linkReportaje(r.id);

        return `
            <div class="col-lg-4 col-md-6 grids5-info mt-5">
                <a href="${url}" class="d-block foto-recorte">
                    <img src="${imagen(r.foto_principal)}"
                         alt="${escapeHTML(r.titulo)}"
                         class="img-fluid">
                </a>

                <div class="blog-info">
                    <h5>${escapeHTML(fechaLarga(r.fecha_publicacion))}</h5>

                    <h4>
                        <a href="${url}" class="d-block">
                            ${escapeHTML(r.titulo)}
                        </a>
                    </h4>

                    <a href="${url}" class="btn mt-4 p-0">
                        Leer <span class="fa fa-arrow-right"></span>
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

/* ------------------------- Noticias ------------------------- */

function renderNoticias(items) {
    const contenedor = document.getElementById('lista-noticias');

    if (!items.length) {
        contenedor.innerHTML =
            '<div class="col-12 text-center py-4"><p>Todavía no hay noticias cargadas.</p></div>';
        return;
    }

    contenedor.innerHTML = items.map((n, index) => `
        <div class="col-lg-4 col-md-6 grids5-info ${index === 0 ? '' : 'mt-lg-0 mt-5'}">
            <a target="_blank"
               rel="noopener"
               href="${escapeHTML(n.link_externo || '#')}"
               class="d-block">
                <img src="${imagen(n.foto)}"
                     alt="${escapeHTML(n.titulo)}"
                     class="img-fluid">
            </a>

            <div class="blog-info">
                <h5>${escapeHTML(fechaLarga(n.fecha_publicacion))}</h5>

                <h4>
                    <a target="_blank"
                       rel="noopener"
                       href="${escapeHTML(n.link_externo || '#')}"
                       class="d-block">
                        ${escapeHTML(n.titulo)}
                    </a>
                </h4>

                <a target="_blank"
                   rel="noopener"
                   href="${escapeHTML(n.link_externo || '#')}"
                   class="btn mt-4 p-0">
                    Leer <span class="fa fa-arrow-right"></span>
                </a>
            </div>
        </div>
    `).join('');
}

/* ------------------------- Boletín ------------------------- */

function renderBoletin(item) {
    const contenedor = document.getElementById('boletin-contenido');

    if (!item) {
        contenedor.innerHTML = `
            <div class="col-12 text-center">
                <p>Todavía no hay boletines cargados.</p>
            </div>
        `;
        return;
    }

    const pdf = item.archivo_pdf
        ? `${BOLETIN_BASE}${encodeURIComponent(item.archivo_pdf)}`
        : null;

    contenedor.innerHTML = `
        <div class="col-lg-8 align-self">
            <h3 class="title-big mb-4">Boletín NTEP</h3>

            <p class="boletin-resumen">${escapeHTML(item.resumen || '')}</p>

            <div class="row mt-sm-4 mt-2 px-3">
                <div class="col-6 p-0">
                    <span>Nº ${escapeHTML(item.numero_boletin || '')}</span>
                    <h4>${escapeHTML(fechaBoletin(item.fecha_publicacion))}</h4>
                </div>

                <div class="col-6 p-0">
                    ${
                        pdf
                        ? `
                            <span>
                                <a href="${pdf}"
                                   target="_blank"
                                   class="facebook">
                                    <span class="fa fa-download"></span>
                                </a>
                            </span>
                            <h4>Ver Boletín</h4>
                          `
                        : `
                            <span class="facebook" style="opacity:.5;">
                                <span class="fa fa-download"></span>
                            </span>
                            <h4>PDF pendiente</h4>
                          `
                    }
                </div>
            </div>

            <div class="text-center text-lg-left mt-4">
                <a href="${PAGINA_BOLETINES}"
                   class="btn btn-style btn-primary">
                    Ver todos
                </a>
            </div>
        </div>

        <div class="col-lg-4 mt-lg-0 mt-4">
            <img src="${imagen(item.foto_portada)}"
                 class="img-fluid"
                 alt="Portada Boletín NTEP">
        </div>
    `;
}

/* ------------------------- Podcasts ------------------------- */

function renderPodcasts(items) {
    const contenedor = document.getElementById('lista-podcasts');

    // Construimos la lista que necesita reproductor.js.
    // Conservamos los identificadores originales de la API.
    const BASE_GITHUB_PAGES = '/dialogo-y-desarrollo-frontend/';

    window.DDP_PODCASTS = items
        .filter(p => p.archivo_audio)
        .map(p => ({
            id: p.id,
            titulo: p.titulo || 'Podcast',
            audio: BASE_GITHUB_PAGES + 'podcasts_audio/' +
                   encodeURIComponent(p.archivo_audio)
        }));

    if (!items.length) {
        contenedor.innerHTML =
            '<div class="col-12 text-center">' +
            '<p>Todavía no hay podcasts cargados.</p>' +
            '</div>';
        return;
    }

    contenedor.innerHTML = items.map(p => {
        const tieneAudio = !!p.archivo_audio;

        return `
            <div class="col-lg-3 col-md-6 mb-4">
                <div
                    class="area-box podcast-card${tieneAudio ? '' : ' podcast-card--sin-audio'}"
                    ${tieneAudio ? `data-id="${escapeHTML(p.id)}"` : ''}
                    tabindex="${tieneAudio ? '0' : '-1'}"
                    role="${tieneAudio ? 'button' : 'group'}"
                    title="${tieneAudio ? 'Reproducir podcast' : 'Audio aún no disponible'}"
                    ${tieneAudio ? 'aria-label="Reproducir ' + escapeHTML(p.titulo) + '"' : ''}
                >
                    <img
                        src="${IMG_BASE}podcast.png"
                        alt="Podcast"
                        class="img-fluid"
                    >

                    <p>${escapeHTML(p.titulo)}</p>

                    ${tieneAudio
                        ? '<span class="podcast-play-icon">' +
                          '<span class="fa fa-play"></span>' +
                          '</span>'
                        : ''
                    }
                </div>
            </div>
        `;
    }).join('');
}

/* ------------------------- Especiales ------------------------- */

function renderEspeciales(items) {
    const contenedor = document.getElementById('lista-especiales');

    if (!items.length) {
        contenedor.innerHTML =
            '<div class="item"><p>Todavía no hay especiales cargados.</p></div>';
        return;
    }

    contenedor.innerHTML = items.map(e => `
        <div class="item">
            <div class="d-grid team-info">
                <div class="column position-relative">
                    <a href="${escapeHTML(e.url_video || '#')}"
                       class="especial-video"
                       target="_blank"
                       rel="noopener">
                        <img src="${imagen(e.imagen)}"
                             alt="${escapeHTML(e.titulo)}"
                             class="img-fluid">
                    </a>
                </div>

                <div class="column">
                    <p>${escapeHTML(e.titulo)}</p>
                </div>
            </div>
        </div>
    `).join('');
}

/* ------------------------- Componentes visuales ------------------------- */

function inicializarComponentes() {
    if (window.jQuery && jQuery.fn.owlCarousel) {
        jQuery('.owl-especiales').owlCarousel({
            loop: true,
            margin: 20,
            nav: true,
            navText: [
                '<span class="fa fa-angle-left" aria-label="Anterior"></span>',
                '<span class="fa fa-angle-right" aria-label="Siguiente"></span>'
            ],
            dots: true,
            responsive: {
                0: { items: 1 },
                576: { items: 2 },
                768: { items: 3 },
                992: { items: 4 }
            }
        });
    }
}

function mostrarError(mensaje) {
    const contenido = document.getElementById('contenido');

    contenido.insertAdjacentHTML(
        'afterbegin',
        `
        <div class="container mt-5 pt-5">
            <div class="alert alert-danger text-center">
                ${escapeHTML(mensaje)}
                <br>
                <small>
                    Revisa la consola del navegador (F12) para ver el detalle técnico.
                </small>
            </div>
        </div>
        `
    );
}
