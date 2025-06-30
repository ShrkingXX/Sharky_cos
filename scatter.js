function setupScatter(triggerId, listId) {
  document.getElementById(triggerId).addEventListener('click', function() {
    const list = document.getElementById(listId);
    list.classList.toggle('active');
  });
}

setupScatter('about-main', 'about-scatter-list');
setupScatter('contact-main', 'contact-scatter-list');

// Toggle JOJO subscatter
document.getElementById('jojo-li').addEventListener('click', function(event) {
    event.stopPropagation(); // Prevent triggering parent scatter
    const sub = this.querySelector('#jojo-subscatter');
    sub.classList.toggle('active');
});