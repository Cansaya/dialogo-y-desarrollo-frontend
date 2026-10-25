(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const formulario = document.getElementById('formulario-contacto');
        const estado = document.getElementById('estado-contacto');

        if (!formulario || !estado) {
            console.error('DDP: no se encontró el formulario de contacto.');
            return;
        }

        formulario.addEventListener('submit', function (evento) {
            evento.preventDefault();

            if (!formulario.reportValidity()) {
                return;
            }

            const nombre = formulario.elements.nombre.value.trim();
            const correo = formulario.elements.correo.value.trim();
            const mensaje = formulario.elements.mensaje.value.trim();

            if (!nombre || !correo || !mensaje) {
                estado.textContent = 'Completa todos los campos antes de continuar.';
                return;
            }

            const destinatario = 'info@dialogoydesarrollo.com.pe';

            const asunto = 'Mensaje de contacto desde Diálogo y Desarrollo';

            const cuerpo = [
                'Mensaje enviado desde el formulario del portal.',
                '',
                'Nombre: ' + nombre,
                'Correo: ' + correo,
                '',
                'Mensaje:',
                mensaje
            ].join('\n');

            const enlaceCorreo =
                'mailto:' + destinatario +
                '?subject=' + encodeURIComponent(asunto) +
                '&body=' + encodeURIComponent(cuerpo);

            estado.textContent =
                'Se abrirá tu aplicación de correo para que revises y envíes el mensaje. ' +
                'Si no se abre, escribe directamente a ' + destinatario + '.';

            window.location.href = enlaceCorreo;
        });

        console.info('DDP: formulario de contacto inicializado.');
    });
})();
