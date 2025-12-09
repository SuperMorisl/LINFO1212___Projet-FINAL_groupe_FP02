// ----------------------------------------
// | Comportement des choix de type DEBUT |
// ----------------------------------------

const typeChips = document.querySelectorAll('.type-chip');
const hiddenTypeInput = document.getElementById('type');

typeChips.forEach(chip => {
    chip.addEventListener('click', () => {
        // On enlève la classe 'selected' de tous les chips
        typeChips.forEach(c => c.classList.remove('selected'));

        // On ajoute 'selected' uniquement à celui cliqué
        chip.classList.add('selected');

        // On met à jour l'input caché avec la valeur du chip
        hiddenTypeInput.value = chip.dataset.value;
    });
});

// --------------------------------------
// | Comportement des choix de type FIN |
// --------------------------------------

// -----------------------------------------
// | Comportement des choix de genre DEBUT |
// -----------------------------------------

const genreChips = document.querySelectorAll('.genre-chip');
const hiddenGenreInput = document.getElementById('genres');

genreChips.forEach(chip => {
    chip.addEventListener('click', () => {
        if (chip.classList.contains('selected')) {
            chip.classList.remove('selected')
        }
        else {
            chip.classList.add('selected')
        }

        const selected = Array.from(genreChips)
            .filter(c => c.classList.contains('selected'))
            .map(c => c.dataset.value);

        hiddenGenreInput.value = selected.join(",");
    });
});

// ---------------------------------------
// | Comportement des choix de genre FIN |
// ---------------------------------------

// Pour retourner à la page d'acceuil :
function goMainPage() {
    window.location.href='/'
}

// Verifie qu'on a bien séléctionné un type et au moins un genre car les attributs hiddens échappent à required

const form = document.querySelector('.form');
form.addEventListener('submit', (e) => {
    const hiddenType = document.getElementById('type');
    const hiddenGenres = document.getElementById('genres');

    if (!hiddenType.value) {
        alert("Veuillez sélectionner un type (Film ou Série) !");
        e.preventDefault();
        return;
    }

    if (!hiddenGenres.value) {
        alert("Veuillez sélectionner au moins un genre !");
        e.preventDefault();
        return;
    }
});

// réccupération des genres
const chips = document.querySelectorAll('.genre-chip');
const genresInput = document.getElementById('genres');
let selectedGenres = [];

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    const value = chip.dataset.value;

    if (selectedGenres.includes(value)) {
      selectedGenres = selectedGenres.filter(g => g !== value);
    } else {
      selectedGenres.push(value);
    }

    // on mets à jour le champ avec une chaine de caractères séparés par des virgules
    genresInput.value = selectedGenres.join(','); 
  });

});
