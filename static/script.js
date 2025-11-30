const burger = document.querySelector('.burger');
const burgerMenu = document.querySelector('.burger-menu');

burger.addEventListener('click', () => {
    if (burgerMenu.style.display === "flex") {
        burgerMenu.style.display = "none";
    }
    else {
        burgerMenu.style.display = "flex";
    }
});

// Ca evite qu'on ouvre le burger menu sur une petite fenêtre et qu'il reste si on agrandi la fenêtre
window.addEventListener('resize', () => {
    if (window.innerWidth > 550) { 
        burgerMenu.style.display = "none";
    }
});