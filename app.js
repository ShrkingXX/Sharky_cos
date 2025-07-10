
const cover = document.querySelector('.cover');
const slider = document.querySelector('.slider');
const logo = document.querySelector('#logo');
const headline = document.querySelector('.headline');

const tl = new TimelineMax();

tl.fromTo(cover, 1, { height: '0%' }, { height: '100%',ease: Power2.easeInOut })
.fromTo(headline, 1.2, { y: '100%' }, { y: '0%', ease: Power2.easeInOut }, '-=1.2')
.fromTo(headline, 1.2, { opacity: 0 }, { opacity: 1, ease: Power2.easeInOut}, '-=1.2')

new fullpage('#fullpage', {
    navigation: true,
    navigationPosition: 'right',
    navigationTooltips: ['Home', 'About', 'Contact', 'Gallery'],
    sectionSelector: '.section',
    sectionColor: ['#1bbc9b', '#4BBFC3', '#7BAABE', '#f90'],
    dropEffects: true,
    showActiveTooltip: true,
});