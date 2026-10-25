<?php
/**
 * Autenticación y permisos del panel de administración.
 * Inclúyelo SIEMPRE al inicio de cualquier archivo dentro de /admin
 * (antes de imprimir cualquier HTML).
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!defined('BASE_URL')) {
    require_once __DIR__ . '/../config/config.php';
}

/** ¿Hay una sesión activa? */
function usuario_autenticado(): bool
{
    return isset($_SESSION['usuario_id']);
}

/** Datos del usuario logueado (o null). */
function usuario_actual(): ?array
{
    if (!usuario_autenticado()) {
        return null;
    }
    return [
        'id'     => $_SESSION['usuario_id'],
        'nombre' => $_SESSION['usuario_nombre'],
        'rol'    => $_SESSION['usuario_rol'],
    ];
}

/** Corta la ejecución y manda al login si no hay sesión. */
function requerir_login(): void
{
    if (!usuario_autenticado()) {
        header('Location: ' . BASE_URL . '/admin/login.php');
        exit;
    }
}

/**
 * Corta la ejecución si el usuario logueado no tiene uno de los roles permitidos.
 * Uso: requerir_rol(['admin', 'editor']);
 */
function requerir_rol(array $rolesPermitidos): void
{
    requerir_login();
    if (!in_array($_SESSION['usuario_rol'], $rolesPermitidos, true)) {
        http_response_code(403);
        echo '<div style="font-family:sans-serif;padding:40px;text-align:center;">
                <h2>Acceso denegado</h2>
                <p>Tu rol (<b>' . htmlspecialchars($_SESSION['usuario_rol']) . '</b>) no tiene permiso para ver esta sección.</p>
                <p><a href="' . BASE_URL . '/admin/dashboard.php">Volver al panel</a></p>
              </div>';
        exit;
    }
}

/** true/false rápido, sin cortar la ejecución (útil para mostrar/ocultar botones). */
function tiene_rol($rolesPermitidos): bool
{
    if (!usuario_autenticado()) {
        return false;
    }
    $rolesPermitidos = (array) $rolesPermitidos;
    return in_array($_SESSION['usuario_rol'], $rolesPermitidos, true);
}
