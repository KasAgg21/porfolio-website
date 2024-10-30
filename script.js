// scripts.js

// Function to copy text to clipboard with tooltip feedback
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // Initialize tooltip
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        })

        // Find the button that was clicked
        var buttons = document.querySelectorAll('button');
        buttons.forEach(function(button) {
            if(button.onclick.toString().includes(text)) {
                button.setAttribute('data-bs-toggle', 'tooltip');
                button.setAttribute('data-bs-placement', 'top');
                button.setAttribute('title', 'Copied!');
                var tooltip = new bootstrap.Tooltip(button);
                button.focus();
                tooltip.show();

                // Hide tooltip after 1.5 seconds
                setTimeout(function() {
                    tooltip.hide();
                    button.removeAttribute('data-bs-toggle');
                    button.removeAttribute('data-bs-placement');
                    button.removeAttribute('title');
                }, 1500);
            }
        });
    }, function(err) {
        alert('Failed to copy text: ', err);
    });
}

// Update current year in footer
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});
