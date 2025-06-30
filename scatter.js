function setupScatter(triggerId, listId) {
  document.getElementById(triggerId).addEventListener('click', function() {
    const list = document.getElementById(listId);
    const isActive = list.classList.contains('active');
    list.classList.toggle('active');
    // If closing about-scatter-list, also close jojo-subscatter
    if (listId === 'about-scatter-list' && isActive) {
      const jojoSub = document.getElementById('jojo-subscatter');
      jojoSub.classList.remove('active');
    }
  });
}

setupScatter('about-main', 'about-scatter-list');
setupScatter('contact-main', 'contact-scatter-list');
setupScatter('jojo-li', 'jojo-subscatter');
