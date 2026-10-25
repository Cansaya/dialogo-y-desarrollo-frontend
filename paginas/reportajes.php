<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/db.php';

$page_title  = 'Reportajes - ' . SITE_NAME;
$page_active = 'reportajes';

$porPagina = 9;
$paginaActual = isset($_GET['pagina']) ? max(1, (int)$_GET['pagina']) : 1;

$stmtTotal = $pdo->query("SELECT COUNT(*) AS c FROM reportajes WHERE estado = 'publicado'");
$total = (int)$stmtTotal->fetch()['c'];
$totalPaginas = max(1, (int)ceil($total / $porPagina));
$paginaActual = min($paginaActual, $totalPaginas);
$offset = ($paginaActual - 1) * $porPagina;

$stmt = $pdo->prepare("SELECT * FROM reportajes WHERE estado = 'publicado' ORDER BY fecha_publicacion DESC LIMIT :limite OFFSET :offset");
$stmt->bindValue(':limite', $porPagina, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$reportajes = $stmt->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>

<section class="breadcrumb-area py-sm-5 py-4">
    <div class="container">
        <div class="breadcrumb-contents">
            <h2 class="title-big">Reportajes</h2>
            <ul class="breadcrumb">
                <li><a href="<?= BASE_URL ?>/index.php">Inicio</a></li>
                <li class="active">Reportajes</li>
            </ul>
        </div>
    </div>
</section>

<div class="grids-block-5 py-5 w3l-blog">
    <section class="py-lg-4 py-md-3">
        <div class="container">
            <div class="row">
                <?php foreach ($reportajes as $r): ?>
                <div class="col-lg-4 col-md-6 grids5-info mt-5">
                    <a href="<?= BASE_URL ?>/paginas/reportaje.php?id=<?= (int)$r['id'] ?>" class="d-block foto-recorte">
                        <img src="<?= BASE_URL ?>/assets/web/img/<?= htmlspecialchars($r['foto_principal'] ?: 'placeholder.jpg') ?>" alt="" class="img-fluid">
                    </a>
                    <div class="blog-info">
                        <h5><?= fecha_larga_es($r['fecha_publicacion']) ?></h5>
                        <h4><a href="<?= BASE_URL ?>/paginas/reportaje.php?id=<?= (int)$r['id'] ?>" class="d-block"><?= htmlspecialchars($r['titulo']) ?></a></h4>
                        <a href="<?= BASE_URL ?>/paginas/reportaje.php?id=<?= (int)$r['id'] ?>" class="btn mt-4 p-0">Leer <span class="fa fa-arrow-right"></span></a>
                    </div>
                </div>
                <?php endforeach; ?>

                <?php if (empty($reportajes)): ?>
                    <div class="col-12 text-center py-4"><p>Todavía no hay reportajes cargados.</p></div>
                <?php endif; ?>
            </div>

            <?php if ($totalPaginas > 1): ?>
            <div class="pagination">
                <ul style="display:flex; justify-content:center; gap:5px; flex-wrap:wrap; padding-left:0;">
                    <?php if ($paginaActual > 1): ?>
                        <li class="prev">
                            <a href="?pagina=<?= $paginaActual - 1 ?>">Ant.</a>
                        </li>
                    <?php endif; ?>

                    <?php for ($p = 1; $p <= $totalPaginas; $p++): ?>
                        <li>
                            <a href="?pagina=<?= $p ?>" class="<?= $p === $paginaActual ? 'active' : '' ?>"><?= $p ?></a>
                        </li>
                    <?php endfor; ?>

                    <?php if ($paginaActual < $totalPaginas): ?>
                        <li class="next">
                            <a href="?pagina=<?= $paginaActual + 1 ?>">Sig.</a>
                        </li>
                    <?php endif; ?>
                </ul>
            </div>
            <?php endif; ?>
        </div>
    </section>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
