(function () {
    'use strict';

    const lista = document.getElementById('lista-boletines');
    const contenedorPaginacion = document.getElementById('paginacion-boletines');

    if (!lista || !contenedorPaginacion) {
        console.error('DDP: no se encontraron los contenedores de boletines.');
        return;
    }

    const API_URL = 'https://3.135.217.244/api/boletines.php';
    const IMAGENES_URL = '../assets/web/img/';
    const BASE_GITHUB_PAGES = '/dialogo-y-desarrollo-frontend/';

    // Formatear la fecha como en la versión PHP original.
    function formatearFecha(fecha) {
        if (!fecha) {
            return 'Fecha no disponible';
        }

        const partes = fecha.split('-');

        if (partes.length !== 3) {
            return fecha;
        }

        const fechaLocal = new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );

        return new Intl.DateTimeFormat('es-PE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(fechaLocal);
    }

    // Crear un elemento de texto sin interpretar contenido como HTML.
    function crearElemento(etiqueta, clase, texto) {
        const elemento = document.createElement(etiqueta);

        if (clase) {
            elemento.className = clase;
        }

        if (texto !== undefined) {
            elemento.textContent = texto;
        }

        return elemento;
    }

    // Crear la tarjeta de un boletín.
    function crearTarjeta(boletin) {
        const columna = crearElemento(
            'div',
            'col-lg-4 col-md-6 grids5-info mt-5'
        );

        const imagen = document.createElement('img');
        imagen.src = IMAGENES_URL + encodeURIComponent(
            boletin.foto_portada || 'placeholder.jpg'
        );
        imagen.alt = 'Portada del boletín NTEP';
        imagen.className = 'img-fluid';
        imagen.loading = 'lazy';

        // Si una portada no existe, intentar mostrar el marcador genérico.
        imagen.addEventListener('error', function () {
            if (!imagen.dataset.fallback) {
                imagen.dataset.fallback = 'true';
                imagen.src = IMAGENES_URL + 'placeholder.jpg';
            }
        });

        const pdfDisponible =
            boletin.pdf_disponible === true &&
            typeof boletin.url_pdf === 'string' &&
            boletin.url_pdf.length > 0;
        
        const urlPdf = pdfDisponible
            ? BASE_GITHUB_PAGES + boletin.url_pdf.replace(/^\/+/, '')
            : null;

        if (pdfDisponible) {
            const enlaceImagen = document.createElement('a');
            enlaceImagen.href = urlpdf;
            enlaceImagen.target = '_blank';
            enlaceImagen.rel = 'noopener noreferrer';
            enlaceImagen.className = 'd-block';
            enlaceImagen.appendChild(imagen);
            columna.appendChild(enlaceImagen);
        } else {
            const contenedorImagen = crearElemento('span', 'd-block');
            contenedorImagen.appendChild(imagen);
            columna.appendChild(contenedorImagen);
        }

        const informacion = crearElemento('div', 'blog-info');

        const fecha = crearElemento(
            'h5',
            '',
            formatearFecha(boletin.fecha_publicacion)
        );

        informacion.appendChild(fecha);

        if (pdfDisponible) {
            const enlacePdf = crearElemento(
                'a',
                'btn mt-4 p-0',
                'Ver Boletín'
            );

            enlacePdf.href = urlpdf;
            enlacePdf.target = '_blank';
            enlacePdf.rel = 'noopener noreferrer';

            informacion.appendChild(enlacePdf);
        } else {
            const aviso = crearElemento(
                'span',
                'btn mt-4 p-0 disabled',
                'PDF no disponible'
            );

            aviso.style.opacity = '0.6';
            aviso.style.cursor = 'not-allowed';
            aviso.title =
                'El PDF aún no fue subido desde el panel de administración';
            aviso.setAttribute('aria-disabled', 'true');

            informacion.appendChild(aviso);
        }

        columna.appendChild(informacion);

        return columna;
    }

    // Dibujar los números de página.
    function crearPaginacion(paginacion) {
        contenedorPaginacion.replaceChildren();

        const paginaActual = Number(paginacion.pagina_actual);
        const totalPaginas = Number(paginacion.total_paginas);

        if (totalPaginas <= 1) {
            return;
        }

        const listaPaginas = document.createElement('ul');
        listaPaginas.style.display = 'flex';
        listaPaginas.style.justifyContent = 'center';
        listaPaginas.style.gap = '5px';
        listaPaginas.style.flexWrap = 'wrap';
        listaPaginas.style.paddingLeft = '0';

        function agregarPagina(texto, pagina, clase, activa) {
            const elemento = document.createElement('li');

            if (clase) {
                elemento.className = clase;
            }

            const enlace = document.createElement('a');
            enlace.href = '?pagina=' + pagina;
            enlace.textContent = texto;

            if (activa) {
                enlace.classList.add('active');
                enlace.setAttribute('aria-current', 'page');
            }

            if (pagina === paginaActual) {
                enlace.addEventListener('click', function (evento) {
                    evento.preventDefault();
                });
            }

            elemento.appendChild(enlace);
            listaPaginas.appendChild(elemento);
        }

        if (paginaActual > 1) {
            agregarPagina('Ant.', paginaActual - 1, 'prev', false);
        }

        for (let pagina = 1; pagina <= totalPaginas; pagina++) {
            agregarPagina(
                String(pagina),
                pagina,
                '',
                pagina === paginaActual
            );
        }

        if (paginaActual < totalPaginas) {
            agregarPagina('Sig.', paginaActual + 1, 'next', false);
        }

        contenedorPaginacion.appendChild(listaPaginas);
    }

    // Consultar la API y mostrar los boletines.
    async function cargarBoletines() {
        lista.replaceChildren(
            crearElemento('div', 'col-12 text-center py-4', 'Cargando boletines...')
        );

        contenedorPaginacion.replaceChildren();

        try {
            const parametros = new URLSearchParams(window.location.search);
            const paginaSolicitada = parametros.get('pagina');

            const url = new URL(API_URL, window.location.href);

            if (paginaSolicitada !== null) {
                url.searchParams.set('pagina', paginaSolicitada);
            }

            const respuesta = await fetch(url);

            if (!respuesta.ok) {
                throw new Error('Error HTTP ' + respuesta.status);
            }

            const resultado = await respuesta.json();

            if (!resultado.success || !Array.isArray(resultado.data)) {
                throw new Error('La respuesta de la API no es válida.');
            }

            lista.replaceChildren();

            if (resultado.data.length === 0) {
                lista.appendChild(
                    crearElemento(
                        'div',
                        'col-12 text-center py-4',
                        'Todavía no hay boletines cargados.'
                    )
                );

                return;
            }

            const fragmento = document.createDocumentFragment();

            resultado.data.forEach(function (boletin) {
                fragmento.appendChild(crearTarjeta(boletin));
            });

            lista.appendChild(fragmento);

            if (resultado.paginacion) {
                crearPaginacion(resultado.paginacion);
            }

        } catch (error) {
            console.error('DDP: error al cargar boletines:', error);

            lista.replaceChildren(
                crearElemento(
                    'div',
                    'col-12 text-center py-4',
                    'No se pudieron cargar los boletines. Inténtalo nuevamente más tarde.'
                )
            );
        }
    }

    cargarBoletines();
})();
