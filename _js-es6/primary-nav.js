export default function PrimaryNav() {

    console.log('hola');

    // cache dom elements
    var body = document.body,
        navTrigger = document.querySelector(".js-nav-trigger"),
        container = document.querySelector(".container"),
        primaryNav = document.querySelector(".js-primary-nav");

    // Flag that JS has loaded
    body.classList.remove("no-js");
    body.classList.add("js");

    // add event ,listener on click
    navTrigger.addEventListener("click", function(){
        // toggle active class on the nav trigger
        this.classList.toggle("open");
        // toggle the active class on site container
        container.classList.toggle("js-nav-active");
    });
};
