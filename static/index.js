// -----------------------------------
// | Comportement de la pop up DEBUT |
// -----------------------------------

function openPopup() {
  document.getElementById("popUp").style.display = "block";
}

function closePopup() {
  document.getElementById("popUp").style.display = "none";
}

// ---------------------------------
// | Comportement de la pop up FIN |
// ---------------------------------

// --------------------------------------------
// | Comportement de lien vers l'oeuvre DEBUT |
// --------------------------------------------

function seeArtwork(title) {
    window.location.href = "/" + encodeURIComponent(title); // On encode car on peut pas mettre /, ?, # ou & dans le nom de notre url
}

// ------------------------------------------
// | Comportement de lien vers l'oeuvre FIN |
// ------------------------------------------

// -------------------------------------
// | Comportement du burger-menu DEBUT |
// -------------------------------------

const burger = document.querySelector('.burger');
const burgerMenu = document.querySelector('.burger-menu');

// Ca permet d'ouvrir/fermer le burger menu tout en changeant son icone
burger.addEventListener('click', () => {
    if (burgerMenu.style.display === "flex") {
        burgerMenu.style.display = "none";
        burger.classList.remove("active");
    }
    else {
        burgerMenu.style.display = "flex";
        burger.classList.add("active");
    }
});

// Ca evite qu'on ouvre le burger menu sur une petite fenêtre et qu'il reste si on agrandi la fenêtre
window.addEventListener('resize', () => {
    if (window.innerWidth > 550) { 
        burgerMenu.style.display = "none";
    }
});

// On ferme le burger menu si on clique ailleurs
document.addEventListener('click', (e) => {
    if (!e.target.closest('.burger-menu') && !e.target.closest('.burger')) {
        burgerMenu.style.display = "none";
        burger.classList.remove("active");
    }
});

// -----------------------------------
// | Comportement du burger-menu FIN |
// -----------------------------------

// --------------------------------
// | Comportement du filtre DEBUT |
// --------------------------------

document.querySelectorAll('.filter').forEach(filtre => {
    const selected = filtre.querySelector('.selected');
    const options = filtre.querySelector('.options');
    selected.addEventListener('click', () => {
        // On ferme le choix si on clique ailleurs ou dessus
        if (selected.classList.contains('active')) {
            options.classList.remove('show');
            selected.classList.remove('active');
        }
        else {
            // En plus d'ouvrir le filtre current, on ferme tous les autres menus actifs
            document.querySelectorAll('.filter .selected.active').forEach(sel => {
                sel.classList.remove('active');
            });
            document.querySelectorAll('.filter .options.show').forEach(opt => {
                opt.classList.remove('show');
            });

            options.classList.add('show');
            selected.classList.add('active');
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.selected')) {
            options.classList.remove('show');
            selected.classList.remove('active');
        }
    });


    // Ca permet de gérer la selection des filtres
    options.querySelectorAll('div').forEach(option => {
        option.addEventListener('click', () => {
            selected.innerHTML = option.innerText + ' <span class="arrow">▼</span>';
            options.classList.remove('show');
            selected.classList.remove('active');
        });
    });
});

// ------------------------------
// | Comportement du filtre FIN |
// ------------------------------

// ------------------------------------------------
// | Mise à jour des choix pour les filtres DEBUT | 
// ------------------------------------------------

// pour pouvoir utiliser les valeurs des sélections de l'utilisateur dans le back

document.querySelectorAll('.filter').forEach(filtre => {
    const options = filtre.querySelector('.options');

    // quand on clique sur un filtre 
    options.querySelectorAll('div').forEach(option => {
        option.addEventListener('click', () => {

            // mets à jour les valeurs sélectionnées des inputs sur le fichier .ejs
            const inputId = filtre.dataset.input; // on réccupère le filtre avec son Id
            document.getElementById(inputId).value = option.dataset.value; // on mets à jour sa valeur

            // envoyer les sélections au back
            document.getElementById('filterForm').submit();
        });
    });
});

// ------------------------------------------------
// | Mise à jour des choix pour les filtres END | 
// ------------------------------------------------
