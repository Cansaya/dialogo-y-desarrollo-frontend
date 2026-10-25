(function () {
    'use strict';

    function obtenerRutaBase() {
        const ruta = window.location.pathname;
        const estaEnPaginas = /\/paginas\/[^/]+$/.test(ruta);

        return estaEnPaginas ? '../' : '';
    }

    async function cargarHeader() {
        const contenedor = document.getElementById('header-container');

        if (!contenedor) {
            console.error(
                'DDP: no se encontró el contenedor #header-container.'
            );
            return;
        }

        const base = obtenerRutaBase();

        try {
            const respuesta = await fetch(base + 'includes/header.html');

            if (!respuesta.ok) {
                throw new Error(
                    'No se pudo cargar header.html. Estado HTTP: ' +
                    respuesta.status
                );
            }

            const html = await respuesta.text();
            contenedor.innerHTML = html;

            // Adaptar las rutas del menú a la ubicación de la página.
            contenedor.querySelectorAll('[data-ddp-href]').forEach(function (enlace) {
                enlace.setAttribute(
                    'href',
                    base + enlace.getAttribute('data-ddp-href')
                );
            });

            // Inicializar el tema después de insertar el encabezado.
            if (typeof window.initThemeSwitch === 'function') {
                window.initThemeSwitch();
            } else {
                console.error(
                    'DDP: no se encontró window.initThemeSwitch(). ' +
                    'Comprueba que theme-change.js se haya cargado.'
                );
            }

            // Cerrar el menú móvil después de seleccionar una opción.
            const menu = contenedor.querySelector('#navbarTogglerDemo02');

            contenedor.querySelectorAll(
                '#navbarTogglerDemo02 .nav-link, ' +
                '#navbarTogglerDemo02 .btn'
            ).forEach(function (enlace) {
                enlace.addEventListener('click', function () {
                    if (
                        window.innerWidth <= 991 &&
                        window.jQuery &&
                        menu &&
                        window.jQuery(menu).hasClass('show')
                    ) {
                        window.jQuery(menu).collapse('hide');
                    }
                });
            });

            // Sombra del encabezado al desplazarse por la página.
            const header = contenedor.querySelector('#site-header');

            if (header) {
                function actualizarSombra() {
                    header.classList.toggle(
                        'nav-fixed',
                        window.scrollY > 50
                    );
                }

                actualizarSombra();
                window.addEventListener('scroll', actualizarSombra, {
                    passive: true
                });
            }

            console.info('DDP: encabezado cargado correctamente.');

        } catch (error) {
            console.error('DDP: error al cargar el encabezado:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cargarHeader);
    } else {
        cargarHeader();
    }
})();