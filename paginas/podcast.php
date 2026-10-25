<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/db.php';

$page_title  = 'Podcast - ' . SITE_NAME;
$page_active = 'podcast';

$podcasts = $pdo->query("SELECT * FROM podcasts ORDER BY fecha_publicacion DESC")->fetchAll();
$videos   = $pdo->query("SELECT * FROM videos ORDER BY fecha_publicacion DESC")->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>

<section class="breadcrumb-area py-sm-5 py-4">
    <div class="container">
        <div class="breadcrumb-contents">
            <h2 class="title-big">Podcast</h2>
            <ul class="breadcrumb">
                <li><a href="<?= BASE_URL ?>/index.php">Inicio</a></li>
                <li class="active">Podcast</li>
            </ul>
        </div>
    </div>
</section>

<section class="py-5">
    <div class="container">
        <div class="row">
            <?php foreach ($podcasts as $p):
                $tieneAudio = !empty($p['archivo_audio']) && is_file(RUTA_PODCASTS_AUDIO . '/' . $p['archivo_audio']);
            ?>
            <div class="col-lg-3 col-sm-6 mt-sm-0 mt-5">
                <div class="area-box podcast-card<?= $tieneAudio ? '' : ' podcast-card--sin-audio' ?>"
                     data-id="<?= (int)$p['id'] ?>"
                     tabindex="0" role="button"
                     title="<?= $tieneAudio ? 'Reproducir' : 'Audio aún no disponible' ?>">
                    <img src="<?= BASE_URL ?>/assets/web/img/podcast.png" alt="">
                    <p><?= htmlspecialchars($p['titulo']) ?></p>
                    <?php if ($tieneAudio): ?>
                        <span class="podcast-play-icon"><span class="fa fa-play"></span></span>
                    <?php endif; ?>
                </div>
            </div>
            <?php endforeach; ?>
            <?php if (empty($podcasts)): ?>
                <div class="col-12 text-center py-4"><p>Todavía no hay episodios cargados.</p></div>
            <?php endif; ?>
        </div>

        <?php if (!empty($videos)): ?>
        <h3 class="title-big text-center my-5">Videos</h3>
        <div class="row">
            <?php foreach ($videos as $v): ?>
            <div class="col-lg-6 mb-4">
                <div class="area-box text-left">
                    <h5 class="title-small mb-2"><?= date('d M, Y', strtotime($v['fecha_publicacion'])) ?></h5>
                    <h4 class="title-big mb-3" style="font-size:1.1rem;"><?= htmlspecialchars($v['titulo']) ?></h4>
                    <div class="embed-responsive embed-responsive-16by9">
                        <iframe class="embed-responsive-item" src="<?= htmlspecialchars($v['url_embed']) ?>" allowfullscreen></iframe>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
    </div>
</section>

<script>
    window.DDP_PODCASTS = <?= json_encode(array_map(function ($p) {
        $existe = !empty($p['archivo_audio']) && is_file(RUTA_PODCASTS_AUDIO . '/' . $p['archivo_audio']);
        return [
            'id'     => (int)$p['id'],
            'titulo' => $p['titulo'],
            'audio'  => $existe ? BASE_URL . '/podcasts_audio/' . rawurlencode($p['archivo_audio']) : null,
        ];
    }, $podcasts), JSON_UNESCAPED_UNICODE) ?>;
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
