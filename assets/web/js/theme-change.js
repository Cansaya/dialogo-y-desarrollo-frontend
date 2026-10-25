(function () {
    const CLAVE_TEMA = 'theme';

    function initThemeSwitch() {
        const temaGuardado = localStorage.getItem(CLAVE_TEMA);
        const tema = temaGuardado === 'dark' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', tema);

        const toggleSwitch = document.querySelector(
            '.theme-switch input[type="checkbox"]'
        );

        if (!toggleSwitch) {
            return;
        }

        toggleSwitch.checked = tema === 'dark';

        // Evitar registrar el mismo evento más de una vez.
        if (toggleSwitch.dataset.themeInitialized === 'true') {
            return;
        }

        toggleSwitch.addEventListener('change', function (event) {
            const nuevoTema = event.target.checked ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', nuevoTema);
            localStorage.setItem(CLAVE_TEMA, nuevoTema);
        });

        toggleSwitch.dataset.themeInitialized = 'true';
    }

    // Permitir que header-loader.js inicialice el selector.
    window.initThemeSwitch = initThemeSwitch;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeSwitch);
    } else {
        initThemeSwitch();
    }
})();