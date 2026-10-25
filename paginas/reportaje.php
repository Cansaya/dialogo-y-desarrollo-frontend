<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/db.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

$stmt = $pdo->prepare("
    SELECT r.*, a.nombres AS autor_nombres, a.ap_paterno AS autor_ap, a.nickname, a.es_nickname
    FROM reportajes r
    LEFT JOIN autores a ON a.id = r.autor_id
    WHERE r.id = :id AND r.estado = 'publicado'
");
$stmt->execute(['id' => $id]);
$reportaje = $stmt->fetch();

if (!$reportaje) {
    http_response_code(404);
}

if ($reportaje) {
    $stmtFotos = $pdo->prepare("SELECT * FROM reportajes_fotos WHERE reportaje_id = :id ORDER BY orden ASC");
    $stmtFotos->execute(['id' => $id]);
    $fotos = $stmtFotos->fetchAll();

    $autorTexto = 'Redacción';
    if (!empty($reportaje['autor_nombres'])) {
        $autorTexto = $reportaje['es_nickname'] && !empty($reportaje['nickname'])
            ? $reportaje['nickname']
            : trim($reportaje['autor_nombres'] . ' ' . $reportaje['autor_ap']);
    }
}

/* Sidebar: Últimas noticias (últimos reportajes publicados, excluyendo el actual) */
$stmtUltimos = $pdo->prepare("
    SELECT id, titulo, fecha_publicacion FROM reportajes
    WHERE estado = 'publicado' AND id != :id
    ORDER BY fecha_publicacion DESC
    LIMIT 3
");
$stmtUltimos->execute(['id' => $id]);
$ultimosReportajes = $stmtUltimos->fetchAll();

/* Sidebar: Archivos (meses con reportajes publicados, para filtrar el listado) */
$archivos = $pdo->query("
    SELECT DATE_FORMAT(fecha_publicacion, '%Y-%m') AS periodo, COUNT(*) AS total
    FROM reportajes
    WHERE estado = 'publicado'
    GROUP BY periodo
    ORDER BY periodo DESC
")->fetchAll();

$page_title  = $reportaje ? $reportaje['titulo'] . ' - ' . SITE_NAME : 'Reportaje no encontrado';
$page_active = 'reportajes';
require_once __DIR__ . '/../includes/header.php';
?>

<section class="breadcrumb-area py-sm-5 py-4">
    <div class="container">
        <div class="breadcrumb-contents">
            <h2 class="title-big"><?= $reportaje ? 'Reportajes' : 'No encontrado' ?></h2>
            <ul class="breadcrumb">
                <li><a href="<?= BASE_URL ?>/index.php">Inicio</a></li>
                <?php if ($reportaje): ?>
                    <li><a href="<?= BASE_URL ?>/paginas/reportajes.php">Reportajes</a></li>
                <?php else: ?>
                    <li class="active">No encontrado</li>
                <?php endif; ?>
            </ul>
        </div>
    </div>
</section>

<section class="w3l-blog py-5">
    <div class="container">
        <?php if (!$reportaje): ?>
            <p class="text-center">El reportaje que buscas no existe o fue eliminado.</p>
            <p class="text-center"><a href="<?= BASE_URL ?>/paginas/reportajes.php" class="btn btn-style btn-primary">Volver a Reportajes</a></p>
        <?php else: ?>
            <div class="row">
                <div class="col-lg-8">
                    <h5 class="title-small mb-2"><?= fecha_larga_es($reportaje['fecha_publicacion']) ?> &middot; <?= htmlspecialchars($autorTexto) ?></h5>
                    <h1 class="title-big mb-4" style="font-size:2rem;"><?= htmlspecialchars($reportaje['titulo']) ?></h1>

                    <img src="<?= BASE_URL ?>/assets/web/img/<?= htmlspecialchars($reportaje['foto_principal'] ?: 'placeholder.jpg') ?>" class="img-fluid radius-image mb-4" alt="">

                    <?php if (!empty($reportaje['resumen_corto'])): ?>
                        <blockquote class="text-center">
                            <q><strong><?= nl2br(htmlspecialchars($reportaje['resumen_corto'])) ?></strong></q>
                        </blockquote>
                    <?php endif; ?>

                    <div class="reportaje-desarrollo">
                        <?= nl2br(htmlspecialchars($reportaje['desarrollo'])) ?>
                    </div>

                    <?php if (!empty($fotos)): ?>
                        <h4 class="title-big mt-5 mb-3" style="font-size:1.3rem;">Galería</h4>
                        <div class="row">
                            <?php foreach ($fotos as $f): ?>
                                <div class="col-md-4 mb-3">
                                    <span class="reportaje-galeria-item">
                                        <img src="<?= BASE_URL ?>/assets/web/img/<?= htmlspecialchars($f['url_foto']) ?>" alt="<?= htmlspecialchars($f['descripcion']) ?>">
                                    </span>
                                    <?php if (!empty($f['descripcion'])): ?>
                                        <small class="d-block text-muted mt-1"><?= htmlspecialchars($f['descripcion']) ?></small>
                                    <?php endif; ?>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($reportaje['pdf_adjunto'])): ?>
                        <a href="<?= BASE_URL ?>/assets/web/img/<?= htmlspecialchars($reportaje['pdf_adjunto']) ?>" target="_blank" class="btn btn-style btn-primary mt-4">
                            <span class="fa fa-download"></span> Descargar PDF adjunto
                        </a>
                    <?php endif; ?>

                    <p class="mt-5"><a href="<?= BASE_URL ?>/paginas/reportajes.php">&larr; Volver a todos los reportajes</a></p>
                </div>

                <div class="col-lg-4 mt-lg-0 mt-5">
                    <div class="categories mb-5">
                        <h6 class="heading-small-text-9 mb-3">Últimas noticias</h6>
                         <ul class="list-unstyled ultimas-noticias-lista">
                            <?php foreach ($ultimosReportajes as $u): ?>
                                <li class="mb-3">
                                    <a href="<?= BASE_URL ?>/paginas/reportaje.php?id=<?= (int)$u['id'] ?>" class="d-block" style="font-size:16px; line-height:22px;">
                                        <strong><?= htmlspecialchars($u['titulo']) ?></strong>
                                    </a>
                                    <span class="sub-inner-text-9"><?= fecha_larga_es($u['fecha_publicacion']) ?></span>
                                </li>
                            <?php endforeach; ?>
                            <?php if (empty($ultimosReportajes)): ?>
                                <li>No hay otros reportajes todavía.</li>
                            <?php endif; ?>
                        </ul>
                    </div>

                    <div class="categories">
                        <h6 class="heading-small-text-9 mb-3">Archivos</h6>
                        <ul>
                            <?php foreach ($archivos as $arch): ?>
                                <li>
                                    <a href="<?= BASE_URL ?>/paginas/reportajes.php?periodo=<?= htmlspecialchars($arch['periodo']) ?>">
                                        <?= periodo_largo_es($arch['periodo']) ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                            <?php if (empty($archivos)): ?>
                                <li>Sin archivos todavía.</li>
                            <?php endif; ?>
                        </ul>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>
</section>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
