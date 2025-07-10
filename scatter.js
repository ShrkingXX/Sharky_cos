function setupScatter(triggerId, listId) {
  document.getElementById(triggerId).addEventListener('click', function() {
    const list = document.getElementById(listId);
    const isActive = list.classList.contains('active');
    list.classList.toggle('active');
    // If closing about-scatter-list, also close jojo-subscatter
    if (listId === 'about-scatter-list' && isActive) {
        const jojoSub = document.getElementById('jojo-subscatter');
        const yuanSub = document.getElementById('yuan-subscatter');
        const blSub = document.getElementById('bl-subscatter');
        const genshinSub = document.getElementById('genshin-subscatter');
        jojoSub.classList.remove('active');
        yuanSub.classList.remove('active');
        blSub.classList.remove('active');
        genshinSub.classList.remove('active');
    }
  });
}

setupScatter('about-main', 'about-scatter-list');
setupScatter('contact-main', 'contact-scatter-list');
setupScatter('jojo-li', 'jojo-subscatter');
setupScatter('yuan-li', 'yuan-subscatter');
setupScatter('bl-li', 'bl-subscatter');
setupScatter('genshin-li', 'genshin-subscatter');