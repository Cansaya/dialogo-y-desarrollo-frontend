<!-- middle: redes sociales -->
<div class="middle py-5">
    <div class="container py-xl-5 py-lg-3">
        <div class="welcome-left text-center py-md-5 py-3">
            <h3 class="title-big">Síguenos en nuestras Redes Sociales</h3>
            <div class="main-social-footer-29">
                <a target="_blank" rel="noopener" href="https://www.facebook.com/DialogoyDesarrolloPeru" class="facebook"><span class="fa fa-facebook-square fa-2x"></span></a>
                <a target="_blank" rel="noopener" href="https://www.tiktok.com/@dialogo.y.desarrollo" class="tiktok"><span class="fa fa-music fa-2x"></span></a>
                <a target="_blank" rel="noopener" href="https://www.instagram.com/dialogo.y.desarrollo/" class="instagram"><span class="fa fa-instagram fa-2x"></span></a>
            </div>
        </div>
    </div>
</div>
<!-- //middle -->

<!-- footer -->
<section class="w3l-footer-29-main py-5" id="footer">
    <div class="footer-29 py-md-3">
        <div class="container">
            <div class="row footer-top-29">
                <div class="col-lg-6 col-md-6 footer-list-29 footer-1">
                    <h6 class="footer-title-29">Quiénes Somos</h6>
                    <p>Somos un espacio de periodismo independiente que busca visibilizar las acciones de diálogo en el país desde una mirada constructiva.</p>
                    <div class="main-social-footer-29">
                        <a target="_blank" rel="noopener" href="https://www.facebook.com/DialogoyDesarrolloPeru" class="facebook"><span class="fa fa-facebook-square"></span></a>
                        <a target="_blank" rel="noopener" href="https://www.tiktok.com/@dialogo.y.desarrollo" class="tiktok"><span class="fa fa-music"></span></a>
                        <a target="_blank" rel="noopener" href="https://www.instagram.com/dialogo.y.desarrollo/" class="instagram"><span class="fa fa-instagram"></span></a>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 footer-list-29 footer-2 mt-md-0 mt-5">
                    <h6 class="footer-title-29">Contenido</h6>
                    <ul>
                        <li><a href="<?= BASE_URL ?>/index.php#actualidad">Noticias</a></li>
                        <li><a href="<?= BASE_URL ?>/index.php">Videos</a></li>
                        <li><a href="<?= BASE_URL ?>/paginas/podcast.php">Podcast</a></li>
                    </ul>
                </div>
                <div class="col-lg-3 col-md-6 mt-lg-0 mt-5 footer-list-29 footer-3">
                    <h6 class="footer-title-29">Contacto</h6>
                    <ul>
                        <li><a href="mailto:info@dialogoydesarrollo.com.pe">info@dialogoydesarrollo.com.pe</a></li>
                    </ul>
                </div>
            </div>
            <div class="bottom-copies text-center">
                <p class="copy-footer-29">&copy; <?= date('Y') ?> <?= SITE_NAME ?>. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>

    <button onclick="topFunction()" id="movetop" title="Ir arriba">
        <span class="fa fa-angle-up"></span>
    </button>
</section>
<!-- //footer -->

<!-- Reproductor de podcasts persistente (barra inferior tipo app de música) -->
<div id="ddp-player-bar" class="ddp-player-bar" hidden>
    <div class="ddp-player-progreso">
        <span id="ddp-player-tiempo-actual" class="ddp-player-tiempo ddp-player-tiempo--actual">0:00</span>
        <input type="range" id="ddp-player-seek" class="ddp-player-seek" min="0" max="0" value="0" step="0.1" title="Ir a un punto del episodio">
        <span id="ddp-player-tiempo-total" class="ddp-player-tiempo">0:00</span>
    </div>
    <div class="ddp-player-fila">
        <div class="ddp-player-info">
            <img src="<?= BASE_URL ?>/assets/web/img/podcast.png" alt="" class="ddp-player-thumb">
            <span id="ddp-player-titulo" class="ddp-player-titulo">—</span>
        </div>
        <div class="ddp-player-controls">
            <button id="ddp-player-prev" type="button" title="Anterior"><span class="fa fa-step-backward"></span></button>
            <button id="ddp-player-toggle" type="button" title="Reproducir / Pausar"><span class="fa fa-play"></span></button>
            <button id="ddp-player-next" type="button" title="Siguiente"><span class="fa fa-step-forward"></span></button>
        </div>
        <div class="ddp-player-volumen">
            <span class="fa fa-volume-up"></span>
            <input type="range" id="ddp-player-vol" min="0" max="100" value="80" title="Volumen">
        </div>
        <button id="ddp-player-close" type="button" class="ddp-player-close" title="Cerrar reproductor"><span class="fa fa-times"></span></button>
    </div>
</div>
<audio id="ddp-player-audio" preload="metadata"></audio>

<!-- Scripts (los mismos archivos reales del sitio original) -->
<script src="<?= BASE_URL ?>/assets/web/js/jquery-3.3.1.min.js"></script>
<script src="<?= BASE_URL ?>/assets/web/js/theme-change.js"></script>
<script src="<?= BASE_URL ?>/assets/web/js/easyResponsiveTabs.js"></script>
<script src="<?= BASE_URL ?>/assets/web/js/owl.carousel.js"></script>
<script src="<?= BASE_URL ?>/assets/web/js/jquery.magnific-popup.min.js"></script>
<script src="<?= BASE_URL ?>/assets/web/js/bootstrap.min.js"></script>
<script src="<?= BASE_URL ?>/assets/web/js/reproductor.js"></script>

<script>
    // Botón "ir arriba"
    window.onscroll = function () { scrollFunction(); };
    function scrollFunction() {
        var btn = document.getElementById("movetop");
        if (!btn) return;
        btn.style.display = (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) ? "block" : "none";
    }
    function topFunction() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    // Sombra en el header al hacer scroll
    $(window).on("scroll", function () {
        $("#site-header").toggleClass("nav-fixed", $(window).scrollTop() >= 80);
    });

    // Popup de video
    $(function () {
        $('.popup-with-zoom-anim').magnificPopup({
            type: 'inline',
            fixedContentPos: false,
            fixedBgPos: true,
            overflowY: 'auto',
            closeBtnInside: true,
            preloader: false,
            midClick: true,
            removalDelay: 300,
            mainClass: 'my-mfp-zoom-in'
        });
    });

    // Carrusel de "Especiales"
    $(function () {
        $('.owl-especiales').owlCarousel({
            loop: true,
            margin: 20,
            nav: true,
            dots: true,
            responsive: {
                0:    { items: 1 },
                480:  { items: 2 },
                768:  { items: 3 },
                1000: { items: 4 }
            }
        });
    });
</script>
</body>
</html>
