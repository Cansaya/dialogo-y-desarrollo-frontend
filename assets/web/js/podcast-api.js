(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', inicializarPodcast);

    async function inicializarPodcast() {
        const estadoPodcasts = document.getElementById('estado-podcasts');
        const listaPodcasts = document.getElementById('lista-podcasts');
        const seccionVideos = document.getElementById('seccion-videos');
        const listaVideos = document.getElementById('lista-videos');
        const estadoVideos = document.getElementById('estado-videos');

        // Preparar la lista que utilizará el reproductor persistente.
        window.DDP_PODCASTS = [];

        // Las dos API se consultan de forma independiente.
        await Promise.all([
            cargarPodcasts(),
            cargarVideos()
        ]);

        async function cargarPodcasts() {
            try {
                const respuesta = await fetch('https://3.135.217.244/api/podcasts.php');

                if (!respuesta.ok) {
                    throw new Error('HTTP ' + respuesta.status);
                }

                const datos = await respuesta.json();

                if (!datos.success || !Array.isArray(datos.podcasts)) {
                    throw new Error('La respuesta de podcasts no es válida.');
                }

                listaPodcasts.replaceChildren();

                window.DDP_PODCASTS = datos.podcasts.map(function (podcast) {
                    return {
                        id: Number(podcast.id),
                        titulo: podcast.titulo,
                        audio: podcast.tiene_audio && podcast.audio
                            ? new URL(podcast.audio, window.location.origin).href
                            : null
                    };
                });

                if (datos.podcasts.length === 0) {
                    estadoPodcasts.textContent =
                        'Todavía no hay episodios cargados.';
                    return;
                }

                datos.podcasts.forEach(function (podcast) {
                    const tieneAudio = Boolean(
                        podcast.tiene_audio && podcast.audio
                    );

                    const columna = document.createElement('div');
                    columna.className = 'col-lg-3 col-sm-6 mt-sm-0 mt-5';

                    const tarjeta = document.createElement('div');
                    tarjeta.className = 'area-box podcast-card';

                    if (!tieneAudio) {
                        tarjeta.classList.add('podcast-card--sin-audio');
                    }

                    tarjeta.dataset.id = podcast.id;
                    tarjeta.setAttribute('tabindex', '0');
                    tarjeta.setAttribute('role', 'button');
                    tarjeta.setAttribute(
                        'title',
                        tieneAudio
                            ? 'Reproducir'
                            : 'Audio aún no disponible'
                    );
                    tarjeta.setAttribute(
                        'aria-label',
                        (tieneAudio ? 'Reproducir: ' : 'Audio no disponible: ')
                        + podcast.titulo
                    );

                    const imagen = document.createElement('img');
                    imagen.src = '../assets/web/img/podcast.png';
                    imagen.alt = '';

                    const titulo = document.createElement('p');
                    titulo.textContent = podcast.titulo;

                    tarjeta.appendChild(imagen);
                    tarjeta.appendChild(titulo);

                    if (tieneAudio) {
                        const icono = document.createElement('span');
                        icono.className = 'podcast-play-icon';

                        const play = document.createElement('span');
                        play.className = 'fa fa-play';

                        icono.appendChild(play);
                        tarjeta.appendChild(icono);
                    }

                    columna.appendChild(tarjeta);
                    listaPodcasts.appendChild(columna);
                });

                estadoPodcasts.hidden = true;

            } catch (error) {
                console.error('DDP: error al cargar podcasts:', error);

                estadoPodcasts.hidden = false;
                estadoPodcasts.textContent =
                    'No se pudieron cargar los episodios. Inténtalo nuevamente.';
            }
        }

        async function cargarVideos() {
            try {
                const respuesta = await fetch('https://3.135.217.244/api/videos.php');

                if (!respuesta.ok) {
                    throw new Error('HTTP ' + respuesta.status);
                }

                const datos = await respuesta.json();

                if (!datos.success || !Array.isArray(datos.videos)) {
                    throw new Error('La respuesta de videos no es válida.');
                }

                listaVideos.replaceChildren();

                if (datos.videos.length === 0) {
                    seccionVideos.hidden = true;
                    return;
                }

                datos.videos.forEach(function (video) {
                    const columna = document.createElement('div');
                    columna.className = 'col-lg-6 mb-4';

                    const tarjeta = document.createElement('div');
                    tarjeta.className = 'area-box text-left';

                    const fecha = document.createElement('h5');
                    fecha.className = 'title-small mb-2';
                    fecha.textContent = formatearFecha(video.fecha_publicacion);

                    const titulo = document.createElement('h4');
                    titulo.className = 'title-big mb-3';
                    titulo.style.fontSize = '1.1rem';
                    titulo.textContent = video.titulo;

                    const contenedorVideo = document.createElement('div');
                    contenedorVideo.className =
                        'embed-responsive embed-responsive-16by9';

                    const iframe = document.createElement('iframe');
                    iframe.className = 'embed-responsive-item';
                    iframe.title = video.titulo;
                    iframe.loading = 'lazy';
                    iframe.allowFullscreen = true;
                    iframe.setAttribute(
                        'allow',
                        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                    );
                    iframe.referrerPolicy = 'strict-origin-when-cross-origin';

                    const urlEmbed = convertirAEmbed(video.url_embed);

                    if (urlEmbed) {
                        iframe.src = urlEmbed;
                    } else {
                        const aviso = document.createElement('p');
                        aviso.textContent =
                            'Este video no tiene una dirección válida.';
                        tarjeta.appendChild(aviso);
                    }

                    contenedorVideo.appendChild(iframe);
                    tarjeta.appendChild(fecha);
                    tarjeta.appendChild(titulo);
                    tarjeta.appendChild(contenedorVideo);
                    columna.appendChild(tarjeta);
                    listaVideos.appendChild(columna);
                });

                seccionVideos.hidden = false;
                estadoVideos.hidden = true;

            } catch (error) {
                console.error('DDP: error al cargar videos:', error);

                estadoVideos.hidden = false;
                estadoVideos.textContent =
                    'No se pudieron cargar los videos.';
            }
        }

        function formatearFecha(fecha) {
            if (!fecha) {
                return '';
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

            return fechaLocal.toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }

        function convertirAEmbed(url) {
            if (!url) {
                return null;
            }

            try {
                const direccion = new URL(url);

                if (
                    direccion.hostname !== 'youtube.com' &&
                    direccion.hostname !== 'www.youtube.com' &&
                    direccion.hostname !== 'm.youtube.com' &&
                    direccion.hostname !== 'youtu.be' &&
                    direccion.hostname !== 'www.youtube-nocookie.com'
                ) {
                    return null;
                }

                let idVideo = '';

                if (
                    direccion.hostname === 'youtu.be'
                ) {
                    idVideo = direccion.pathname.split('/').filter(Boolean)[0] || '';
                } else if (direccion.pathname === '/watch') {
                    idVideo = direccion.searchParams.get('v') || '';
                } else if (
                    direccion.pathname.startsWith('/embed/') ||
                    direccion.pathname.startsWith('/shorts/')
                ) {
                    idVideo = direccion.pathname.split('/')[2] || '';
                }

                if (!/^[a-zA-Z0-9_-]{11}$/.test(idVideo)) {
                    return null;
                }

                return 'https://www.youtube.com/embed/' + idVideo;

            } catch (error) {
                return null;
            }
        }
    }
})();
