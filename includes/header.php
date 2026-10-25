<?php
/**
 * Header compartido por todo el sitio.
 *
 * Antes de hacer include('includes/header.php') puedes definir:
 *   $page_title  -> título de la pestaña del navegador
 *   $page_active -> 'inicio' | 'reportajes' | 'podcast' | 'boletines' | 'contacto'
 *
 * Si no se definen, se usan valores por defecto.
 */

if (!defined('BASE_URL')) {
    require_once __DIR__ . '/../config/config.php';
}

$page_title  = $page_title  ?? SITE_NAME . ' - Periodismo constructivo';
$page_active = $page_active ?? '';

function nav_active($seccion, $page_active)
{
    return $seccion === $page_active ? 'active' : '';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><?= htmlspecialchars($page_title) ?></title>

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Cabin:400,500,600&subset=latin-ext,vietnamese" rel="stylesheet">

    <!-- Hoja de estilos real del sitio (Bootstrap + Font Awesome + Owl Carousel +
         Magnific Popup ya vienen empaquetados dentro de este único archivo) -->
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/web/css/style-starter.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/web/css/ajustes.css">
</head>
<body>

<!-- header -->
<header id="site-header" class="fixed-top">
    <div class="container">
        <nav class="navbar navbar-expand-lg stroke">
            <a class="navbar-brand" href="<?= BASE_URL ?>/index.php">
                <img src="<?= BASE_URL ?>/assets/web/img/logo.png" alt="<?= SITE_NAME ?>" title="<?= SITE_NAME ?>" style="height:75px;">
            </a>

            <button class="navbar-toggler collapsed" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon fa icon-expand fa-bars"></span>
                <span class="navbar-toggler-icon fa icon-close fa-times"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item <?= nav_active('inicio', $page_active) ?>">
                        <a class="nav-link" href="<?= BASE_URL ?>/index.html">Inicio</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="<?= BASE_URL ?>/index.php#actualidad">Actualidad</a>
                    </li>
                    <li class="nav-item <?= nav_active('reportajes', $page_active) ?>">
                        <a class="nav-link" href="<?= BASE_URL ?>/paginas/reportajes.php">Reportajes</a>
                    </li>
                    <li class="nav-item <?= nav_active('podcast', $page_active) ?>">
                        <a class="nav-link" href="<?= BASE_URL ?>/paginas/podcast.php">Podcast</a>
                    </li>
                    <li class="nav-item <?= nav_active('boletines', $page_active) ?>">
                        <a class="nav-link" href="<?= BASE_URL ?>/paginas/boletines.php">Boletín NTEP</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="<?= BASE_URL ?>/paginas/contacto.php#alianzas">Alianzas</a>
                    </li>
                    <li class="nav-item <?= nav_active('contacto', $page_active) ?>">
                        <a class="nav-link" href="<?= BASE_URL ?>/paginas/contacto.php">Sobre D&amp;D</a>
                    </li>
                    <li class="ml-2">
                        <a href="<?= BASE_URL ?>/paginas/contacto.php" class="btn btn-style btn-outline-secondary">Contacto</a>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
</header>
<!-- //header -->
