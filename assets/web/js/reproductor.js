/**
 * Reproductor de podcasts persistente (barra inferior tipo "reproductor de música").
 *
 * Cómo funciona:
 * - La barra y el <audio> viven en includes/footer.php, así que existen en
 *   TODAS las páginas del sitio.
 * - Cada página que muestra podcasts (index.php y paginas/podcast.php) define
 *   un array global `window.DDP_PODCASTS = [{id, titulo, audio}, ...]` y le
 *   pone a cada tarjeta de podcast un atributo data-id.
 * - Al hacer click en una tarjeta, buscamos su posición dentro de la lista y
 *   empezamos a reproducir desde ahí. Anterior/Siguiente se mueven dentro de
 *   esa misma lista.
 * - El estado (qué lista, qué canción, en qué segundo va, si está sonando o
 *   en pausa, el volumen) se guarda en localStorage. Cuando cambias de
 *   página, el navegador recarga todo (esto no es una SPA), así que al
 *   cargar cada página este script vuelve a leer localStorage y reconstruye
 *   la barra con el mismo episodio, en el mismo punto.
 *
 * OJO: por políticas de autoplay de los navegadores, si el usuario venía
 * escuchando audio, seguir reproduciendo automáticamente al cambiar de
 * página normalmente SÍ funciona (Chrome/Edge/Firefox lo permiten cuando ya
 * hubo interacción previa en el mismo sitio). Pero no todos los navegadores
 * lo garantizan al 100%; si el navegador bloquea el autoplay, la barra igual
 * aparece con el episodio cargado y el botón de Play, listo para que el
 * usuario solo tenga que pulsar Play una vez.
 */
(function () {
    'use strict';

    var CLAVE_ESTADO = 'ddpPlayerState';

    var audio   = document.getElementById('ddp-player-audio');
    var barra   = document.getElementById('ddp-player-bar');
    if (!audio || !barra) return; // footer.php no cargó el reproductor (no debería pasar)

    var elTitulo   = document.getElementById('ddp-player-titulo');
    var btnToggle  = document.getElementById('ddp-player-toggle');
    var btnPrev    = document.getElementById('ddp-player-prev');
    var btnNext    = document.getElementById('ddp-player-next');
    var btnCerrar  = document.getElementById('ddp-player-close');
    var sliderVol  = document.getElementById('ddp-player-vol');
    var sliderSeek = document.getElementById('ddp-player-seek');
    var elTiempoActual = document.getElementById('ddp-player-tiempo-actual');
    var elTiempoTotal  = document.getElementById('ddp-player-tiempo-total');
    var iconoToggle = btnToggle ? btnToggle.querySelector('span') : null;
    var arrastrandoSeek = false; // true mientras el usuario mueve la barra de progreso

    function formatoTiempo(segundos) {
        segundos = Math.floor(segundos) || 0;
        var min = Math.floor(segundos / 60);
        var seg = segundos % 60;
        return min + ':' + (seg < 10 ? '0' : '') + seg;
    }

    /** Pone el aro rojo (.podcast-card--activa) sobre la tarjeta de la pista
     *  que está sonando actualmente, si esa tarjeta existe en la página. */
    function marcarTarjetaActiva() {
        var tarjetas = document.querySelectorAll('.podcast-card');
        var pista = pistaActual();
        for (var i = 0; i < tarjetas.length; i++) {
            var esActiva = pista && estado.reproduciendo && String(tarjetas[i].getAttribute('data-id')) === String(pista.id);
            tarjetas[i].classList.toggle('podcast-card--activa', !!esActiva);
        }
    }

    var estado = {
        lista: [],
        indice: -1,
        tiempo: 0,
        reproduciendo: false,
        volumen: 80
    };

    function leerEstadoGuardado() {
        try {
            var crudo = localStorage.getItem(CLAVE_ESTADO);
            if (!crudo) return null;
            var datos = JSON.parse(crudo);
            if (datos && Array.isArray(datos.lista)) return datos;
        } catch (e) { /* localStorage corrupto o bloqueado: seguimos sin estado */ }
        return null;
    }

    function guardarEstado() {
        try {
            localStorage.setItem(CLAVE_ESTADO, JSON.stringify(estado));
        } catch (e) { /* modo incógnito con storage lleno/bloqueado: no pasa nada grave */ }
    }

    function borrarEstado() {
        try { localStorage.removeItem(CLAVE_ESTADO); } catch (e) {}
    }

    function pistaActual() {
        return estado.lista[estado.indice] || null;
    }

    function actualizarIconoPlay(reproduciendo) {
        if (!iconoToggle) return;
        iconoToggle.className = reproduciendo ? 'fa fa-pause' : 'fa fa-play';
    }

    function mostrarBarra() {
        barra.hidden = false;
        barra.classList.add('ddp-player-bar--visible');
    }

    function ocultarBarra() {
        barra.hidden = true;
        barra.classList.remove('ddp-player-bar--visible');
    }

    function cargarPista(reanudarTiempo) {
        var pista = pistaActual();
        if (!pista || !pista.audio) return;

        if (elTitulo) elTitulo.textContent = pista.titulo || 'Podcast';
        audio.src = pista.audio;
        audio.volume = (estado.volumen || 80) / 100;

        if (sliderSeek) sliderSeek.value = 0;
        if (elTiempoActual) elTiempoActual.textContent = '0:00';
        if (elTiempoTotal) elTiempoTotal.textContent = '0:00';

        if (reanudarTiempo) {
            audio.addEventListener('loadedmetadata', function alSuscribir() {
                audio.currentTime = estado.tiempo || 0;
                audio.removeEventListener('loadedmetadata', alSuscribir);
            });
        }

        mostrarBarra();
        marcarTarjetaActiva();
    }

    function reproducir() {
        var promesa = audio.play();
        if (promesa && typeof promesa.catch === 'function') {
            promesa.then(function () {
                estado.reproduciendo = true;
                actualizarIconoPlay(true);
                marcarTarjetaActiva();
                guardarEstado();
            }).catch(function () {
                // El navegador bloqueó el autoplay: dejamos la barra visible
                // y en pausa, para que el usuario solo tenga que dar Play.
                estado.reproduciendo = false;
                actualizarIconoPlay(false);
                marcarTarjetaActiva();
                guardarEstado();
            });
        }
    }

    function pausar() {
        audio.pause();
        estado.reproduciendo = false;
        actualizarIconoPlay(false);
        marcarTarjetaActiva();
        guardarEstado();
    }

    function iniciarReproduccion(lista, indice) {
        estado.lista = lista;
        estado.indice = indice;
        estado.tiempo = 0;
        cargarPista(false);
        reproducir();
    }

    function irA(delta) {
        if (!estado.lista.length) return;
        estado.indice = (estado.indice + delta + estado.lista.length) % estado.lista.length;
        estado.tiempo = 0;
        cargarPista(false);
        reproducir();
    }

    // --- Controles de la barra ---
    if (btnToggle) {
        btnToggle.addEventListener('click', function () {
            if (audio.paused) reproducir(); else pausar();
        });
    }
    if (btnPrev) btnPrev.addEventListener('click', function () { irA(-1); });
    if (btnNext) btnNext.addEventListener('click', function () { irA(1); });
    if (btnCerrar) {
        btnCerrar.addEventListener('click', function () {
            pausar();
            audio.removeAttribute('src');
            ocultarBarra();
            estado = { lista: [], indice: -1, tiempo: 0, reproduciendo: false, volumen: estado.volumen };
            if (sliderSeek) { sliderSeek.value = 0; sliderSeek.max = 0; }
            if (elTiempoActual) elTiempoActual.textContent = '0:00';
            if (elTiempoTotal) elTiempoTotal.textContent = '0:00';
            marcarTarjetaActiva();
            borrarEstado();
        });
    }
    if (sliderVol) {
        sliderVol.addEventListener('input', function () {
            var v = parseInt(sliderVol.value, 10) || 0;
            audio.volume = v / 100;
            estado.volumen = v;
            guardarEstado();
        });
    }
    if (sliderSeek) {
        // Mientras el usuario arrastra, no dejamos que "timeupdate" le pise el valor
        ['mousedown', 'touchstart'].forEach(function (ev) {
            sliderSeek.addEventListener(ev, function () { arrastrandoSeek = true; });
        });
        ['mouseup', 'touchend'].forEach(function (ev) {
            sliderSeek.addEventListener(ev, function () { arrastrandoSeek = false; });
        });
        // Mientras arrastra: solo movemos el número de tiempo (feedback visual)
        sliderSeek.addEventListener('input', function () {
            if (elTiempoActual) elTiempoActual.textContent = formatoTiempo(sliderSeek.value);
        });
        // Al soltar: recién ahí saltamos el audio al segundo elegido
        sliderSeek.addEventListener('change', function () {
            audio.currentTime = parseFloat(sliderSeek.value) || 0;
            arrastrandoSeek = false;
        });
    }

    audio.addEventListener('durationchange', function () {
        if (!isFinite(audio.duration)) return;
        if (sliderSeek) sliderSeek.max = audio.duration;
        if (elTiempoTotal) elTiempoTotal.textContent = formatoTiempo(audio.duration);
    });

    audio.addEventListener('timeupdate', function () {
        estado.tiempo = audio.currentTime;
        if (!arrastrandoSeek) {
            if (sliderSeek) sliderSeek.value = audio.currentTime;
            if (elTiempoActual) elTiempoActual.textContent = formatoTiempo(audio.currentTime);
        }
        guardarEstado();
    });
    audio.addEventListener('ended', function () {
        irA(1);
    });

    // --- Restaurar el estado guardado al cargar cualquier página ---
    var guardado = leerEstadoGuardado();
    if (guardado && guardado.lista.length && guardado.indice >= 0) {
        estado = guardado;
        if (sliderVol) sliderVol.value = estado.volumen || 80;
        cargarPista(true);
        actualizarIconoPlay(false);
        if (estado.reproduciendo) {
            reproducir();
        }
    } else if (sliderVol) {
        sliderVol.value = estado.volumen;
    }

    // --- Enganchar las tarjetas de podcast de la página actual (si existen) ---
    document.addEventListener('click', function (ev) {
        var tarjeta = ev.target.closest ? ev.target.closest('.podcast-card') : null;
        if (!tarjeta) return;
        if (tarjeta.classList.contains('podcast-card--sin-audio')) return;

        var lista = window.DDP_PODCASTS || [];
        var id = tarjeta.getAttribute('data-id');
        var idx = -1;
        for (var i = 0; i < lista.length; i++) {
            if (String(lista[i].id) === String(id)) { idx = i; break; }
        }
        if (idx === -1) return;
        iniciarReproduccion(lista, idx);
    });

    // Accesibilidad: permitir reproducir con Enter/Espacio sobre la tarjeta
    document.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Enter' && ev.key !== ' ') return;
        var tarjeta = ev.target.closest ? ev.target.closest('.podcast-card') : null;
        if (!tarjeta) return;
        ev.preventDefault();
        tarjeta.click();
    });
})();
