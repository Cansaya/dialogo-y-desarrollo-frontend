<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/db.php';

$page_title  = 'Boletín NTEP - ' . SITE_NAME;
$page_active = 'boletines';

$porPagina = 9;
$paginaActual = isset($_GET['pagina']) ? max(1, (int)$_GET['pagina']) : 1;

$stmtTotal = $pdo->query("SELECT COUNT(*) AS c FROM boletines");
$total = (int)$stmtTotal->fetch()['c'];
$totalPaginas = max(1, (int)ceil($total / $porPagina));
$paginaActual = min($paginaActual, $totalPaginas);
$offset = ($paginaActual - 1) * $porPagina;

$stmt = $pdo->prepare("SELECT * FROM boletines ORDER BY fecha_publicacion DESC LIMIT :limite OFFSET :offset");
$stmt->bindValue(':limite', $porPagina, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$boletines = $stmt->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>

<section class="breadcrumb-area py-sm-5 py-4">
    <div class="container">
        <div class="breadcrumb-contents">
            <h2 class="title-big">Boletines NTEP</h2>
            <ul class="breadcrumb">
                <li><a href="<?= BASE_URL ?>/index.php">Inicio</a></li>
                <li class="active">Boletines</li>
            </ul>
        </div>
    </div>
</section>

<div class="grids-block-5 py-5">
    <section class="py-lg-4 py-md-3">
        <div class="container">
            <div class="row">
                <?php foreach ($boletines as $b):
                    $pdfExiste = !empty($b['archivo_pdf']) && is_file(RUTA_BOLETINES . '/' . $b['archivo_pdf']);
                    $urlPdf = $pdfExiste ? BASE_URL . '/boletines/' . rawurlencode($b['archivo_pdf']) : '';
                ?>
                <div class="col-lg-4 col-md-6 grids5-info mt-5">
                    <?php if ($pdfExiste): ?>
                        <a href="<?= $urlPdf ?>" target="_blank" class="d-block">
                            <img src="<?= BASE_URL ?>/assets/web/img/<?= htmlspecialchars($b['foto_portada'] ?: 'placeholder.jpg') ?>" alt="" class="img-fluid">
                        </a>
                    <?php else: ?>
                        <span class="d-block">
                            <img src="<?= BASE_URL ?>/assets/web/img/<?= htmlspecialchars($b['foto_portada'] ?: 'placeholder.jpg') ?>" alt="" class="img-fluid">
                        </span>
                    <?php endif; ?>

                    <div class="blog-info">
                        <h5><?= fecha_larga_es($b['fecha_publicacion']) ?></h5>
                        
                        <?php if ($pdfExiste): ?>
                            <a href="<?= $urlPdf ?>" target="_blank" class="btn mt-4 p-0">Ver Boletín</a>
                        <?php else: ?>
                            <span class="btn mt-4 p-0 disabled" style="opacity:.6; cursor:not-allowed;" title="El PDF aún no fue subido desde el panel de administración">PDF no disponible</span>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endforeach; ?>

                <?php if (empty($boletines)): ?>
                    <div class="col-12 text-center py-4"><p>Todavía no hay boletines cargados.</p></div>
                <?php endif; ?>
            </div>

            <?php if ($totalPaginas > 1): ?>
            <div class="pagination">
                <ul style="display:flex; justify-content:center; gap:5px; flex-wrap:wrap; padding-left:0;">
                    <?php if ($paginaActual > 1): ?>
                        <li class="prev"><a href="?pagina=<?= $paginaActual - 1 ?>">Ant.</a></li>
                    <?php endif; ?>

                    <?php for ($p = 1; $p <= $totalPaginas; $p++): ?>
                        <li><a href="?pagina=<?= $p ?>" class="<?= $p === $paginaActual ? 'active' : '' ?>"><?= $p ?></a></li>
                    <?php endfor; ?>

                    <?php if ($paginaActual < $totalPaginas): ?>
                        <li class="next"><a href="?pagina=<?= $paginaActual + 1 ?>">Sig.</a></li>
                    <?php endif; ?>
                </ul>
            </div>
            <?php endif; ?>
        </div>
    </section>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
