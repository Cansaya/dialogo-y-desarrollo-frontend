(function () {
    'use strict';

    function obtenerRutaBase() {
        const ruta = window.location.pathname;
        const estaEnPaginas = /\/paginas\/[^/]+$/.test(ruta);

        return estaEnPaginas ? '../' : '';
    }

    async function cargarFooter() {
        const espacioFooter = document.getElementById('footer-container');

        if (!espacioFooter) {
            console.error('DDP: no se encontró #footer-container.');
            return;
        }

        const base = obtenerRutaBase();

        try {
            // Cargar el pie de página con la ruta correcta.
            const respuesta = await fetch(base + 'includes/footer.html');

            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status}`);
            }

            espacioFooter.innerHTML = await respuesta.text();

            // Cargar el reproductor después de insertar su HTML.
            const scriptReproductor = document.createElement('script');
            scriptReproductor.src = base + 'assets/web/js/reproductor.js';

            scriptReproductor.onerror = function () {
                console.error('DDP: no se pudo cargar reproductor.js.');
            };

            document.body.appendChild(scriptReproductor);

            // Corregir las rutas de los recursos del footer.
            const imagenPodcast = espacioFooter.querySelector(
                '.ddp-player-thumb'
            );

            if (imagenPodcast) {
                imagenPodcast.src = base + 'assets/web/img/podcast.png';
            }

            // Adaptar los enlaces del pie de página.
            espacioFooter.querySelectorAll('[data-ddp-href]').forEach(
                function (enlace) {
                    enlace.setAttribute(
                        'href',
                        base + enlace.getAttribute('data-ddp-href')
                    );
                }
            );

            // Botón "Ir arriba".
            const botonArriba = document.getElementById('movetop');

            if (botonArriba) {
                function actualizarBotonArriba() {
                    botonArriba.style.display =
                        window.scrollY > 20 ? 'block' : 'none';
                }

                window.addEventListener('scroll', actualizarBotonArriba);

                botonArriba.addEventListener('click', function () {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });

                actualizarBotonArriba();
            }

            // Sombra del encabezado al desplazarse.
            if (window.jQuery) {
                jQuery(window).on('scroll', function () {
                    jQuery('#site-header').toggleClass(
                        'nav-fixed',
                        window.scrollY >= 80
                    );
                });
            }

            console.info('DDP: footer.html cargado correctamente.');

        } catch (error) {
            console.error(
                'DDP: no se pudo cargar includes/footer.html:',
                error
            );
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cargarFooter);
    } else {
        cargarFooter();
    }
})();
