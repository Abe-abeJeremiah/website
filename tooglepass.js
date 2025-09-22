document.addEventListener('DOMContentLoaded', function () {
    const eyeIcons = document.querySelectorAll('.input-group .eye-icon');

    eyeIcons.forEach(function (icon) {
        icon.addEventListener('click', function () {
            const input = icon.parentElement.querySelector('input[type="password"], input[type="text"]');
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                } else {
                    input.type = 'password';
                }
            }
        });
    });
});
