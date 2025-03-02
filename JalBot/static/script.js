// Example: Alert on navigation link click
document.querySelectorAll('.top-nav ul li a').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        alert('Navigating to ' + this.textContent + ' section!');
    });
});
const cors = require('cors');
app.use(cors());
