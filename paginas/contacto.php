<?php
require_once __DIR__ . '/../config/config.php';
$page_title  = 'Sobre D&D - ' . SITE_NAME;
$page_active = 'contacto';
require_once __DIR__ . '/../includes/header.php';
?>

<section class="breadcrumb-area py-sm-5 py-4">
    <div class="container">
        <div class="breadcrumb-contents">
            <h2 class="title-big">Sobre Diálogo y Desarrollo</h2>
        </div>
    </div>
</section>

<section class="py-5">
    <div class="container">
        <div class="row">
            <div class="col-lg-6">
                <h3 class="title-big mb-3">Quiénes somos</h3>
                <p>Somos un espacio de periodismo independiente que busca visibilizar las acciones de diálogo en el país desde una mirada constructiva.</p>

                <h3 class="title-big mt-5 mb-3" id="alianzas">Alianzas</h3>
                <p>Trabajamos junto a organizaciones e instituciones interesadas en promover el diálogo social y el desarrollo territorial en el Perú.</p>
            </div>
            <div class="col-lg-6">
                <h3 class="title-big mb-3">Contacto</h3>
                <p><span class="fa fa-envelope"></span> <a href="mailto:info@dialogoydesarrollo.com.pe">info@dialogoydesarrollo.com.pe</a></p>

                <form>
                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" class="form-control" name="nombre" required>
                    </div>
                    <div class="form-group">
                        <label>Correo</label>
                        <input type="email" class="form-control" name="correo" required>
                    </div>
                    <div class="form-group">
                        <label>Mensaje</label>
                        <textarea class="form-control" name="mensaje" rows="4" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-style btn-primary">Enviar mensaje</button>
                    
                </form>
            </div>
        </div>
    </div>
</section>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
