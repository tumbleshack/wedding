export default function Hero() {

    let viewPortHeight = $(window).height();
    let heroBg = document.querySelector(".hero-bg");
    let hero = document.querySelector(".hero");
    let heroHeight = ((viewPortHeight - 200) + "px");

    heroBg.style.height = heroHeight;
    hero.style.height = heroHeight;

};
