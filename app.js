var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require("body-parser");

const checkLoginInput = require('./tests/checkLoginInput');
const checkAddInput = require('./tests/checkAddInput');

const dbModule = require('./database/db'); // renvoie un dico avec les imports : fonctions (voir exports db.js)


let seriesCollection = null;
let moviesCollection = null;
let usersCollection = null;
let trophiesCollection = null;

// Configuration de l'app
app.use(session({ // On crée une session (Cookies)
  secret: 'monsecret',
  resave: false,
  saveUninitialized: true
}));


app.use(express.static('static'));  // Utilise les fichiers de front-end du dossier static
app.set('views', 'templates'); // Les fichiers html/ejs sont dans templates
app.set('view engine', 'ejs'); // On utilise ejs comme moteur de vue
app.use(bodyParser.urlencoded({ extended: true })); // Permet de recupérer les éléments obtenus par la méthode POST


//--------------------------------------------------- LES ROUTES ----------------------------------------------------------------------

app.get('/', async function (req, res) {
  
  try {
    const allMovies = await dbModule.getMovies(); //renvoi des films et séries dans la page d'accueil
    const allSeries = await dbModule.getSeries();
    const allGenres = await dbModule.getGenres();
    let userLevel = 1;
    let xp = req.session.xp;

    while (xp && xp >= 100) { // xp = undefined -> false
        userLevel++;
        xp -= 100;
    }
  
    res.render('index', {
      username: req.session.username,
      userDate: req.session.date,
      userXp: xp,
      userLevel: userLevel,
      movies: allMovies,
      series: allSeries, 
      allMovies: allMovies,
      allSeries: allSeries,
      genres: allGenres,
      error: null
    });
  } catch (err) {
    res.status(500).send("Problème avec la récupération des données dans la db");
  }
});

// Fonction pour la barre de recherche de la page index.ejs
app.post('/search', async function (req, res) { // il peut y avoir plusieurs séries et films avec un même titre
  const title = req.body.search.trim(); // on réccupère le nom du film ou de la série
  if (!title || title === "") {
    return res.redirect('/'); // le return sert à éviter que le reste de la fonction ne se fasse
  }

  try {
    const allGenres = await dbModule.getGenres();
    const allSeries = await dbModule.getSeries();
    const allMovies = await dbModule.getMovies();
    const series = await seriesCollection.find({ title: { $regex: `^${title}$`, $options: 'i' } }).toArray();
    const movies = await moviesCollection.find({ title: { $regex: `^${title}$`, $options: 'i' } }).toArray();
    

    if (series.length === 0 && movies.length === 0) { // si aucun résultat n'a été trouvé dans la db
      res.render('index', {
        username : req.session.username,
        userDate: req.session.date,
        userXp: req.session.xp,
        userLevel: req.session.xp, // c'est temporaire en attendant de gérer les niveaux
        movies: movies,
        series: series,
        allMovies: allMovies,
        allSeries: allSeries,
        genres: allGenres,
        error: "Aucune oeuvre portant ce titre n'a été trouvée."
      });
    }

    else {
      res.render('index', {
        username: req.session.username,
        userDate: req.session.date,
        userXp: req.session.xp,
        userLevel: req.session.xp,
        movies: movies,
        series: series,
        allMovies: allMovies,
        allSeries: allSeries,
        genres: allGenres,
        error: null
      });
    }
  }
  catch (err) {
     console.error(err);
     res.status(500).send("Erreur dans la réccupération des données");
  }
});

// Fonction pour le filtre de la page index.ejs
app.post('/filter', async function (req, res) { 

  //const type = req.body.type; ------------> il faut gérer la réccupération des input de l'utilisateur via le javascript
  //const genre = req.body.genre;
  //const popularity = req.body.popularity;

  const allMovies = await dbModule.getMovies(); 
  const allSeries = await dbModule.getSeries();
  const allGenres = await dbModule.getGenres();

  res.render('index', {
        username: req.session.username,
        userDate: req.session.date,
        userXp: req.session.xp,
        userLevel: req.session.xp,
        movies: allMovies,
        series: allSeries,
        allMovies: allMovies,
        allSeries: allSeries,
        genres: allGenres,
        error: null
      });

});

//------------------------------------------------------------------
app.get('/login', (req, res) => {
  if (req.session.username) { // si l'utilisateur est déjà connecté
    res.redirect('/profile'); // l'utilisateur verra son profile avec son niveau et ses trophés
  }
      
  res.render('login', { error: null, hasAccount: null });  // error permet de vérifier si le mot de passe est correct (voir dans login.ejs)

});

app.post('/login', async (req, res) => {
  try {
    const actualUser = await usersCollection.findOne({ username: req.body.username }); // On réccupère l'utilisateur s'il existe dans la db
    if (actualUser && req.body.password == actualUser.password) { // Vérification de si l'utilisateur existe dans db
      req.session.username = req.body.username;   // Stocke le username dans la session
      req.session.date = actualUser.creation;
      req.session.xp = actualUser.xp;
      res.redirect('/');
    }
    else if (!actualUser) {
      res.render('login', { error: "Utilisateur non trouvé", hasAccount: true });
    }
    else if (req.body.password != actualUser.password) {
      res.render('login', { error: "Mot de passe incorrect", hasAccount: true });
    }
  }
  catch (err) {
    res.status(500).send("Problème avec la récup des données dans la db");
  }
});

app.post('/register', async function (req, res) { 
  try {
    const user = await usersCollection.findOne({ username: req.body.username });
    if (user) { // si l'utilisateur a déjà un compte
      return res.render('login', { error: "L'utilisateur existe déjà", hasAccount: false });
    }
    else if (req.body.username && req.body.password && req.body.email) {
      if (!checkLoginInput.isValidUsername(req.body.username)) {
        return res.render('login', { error: "Nom d'utilisateur invalide", hasAccount: false });
      }
      if (!checkLoginInput.isValidEmail(req.body.email)) {
        return res.render('login', { error: "Adresse email invalide", hasAccount: false });
      }
      if (!checkLoginInput.isValidPassword(req.body.password)) {
        return res.render('login', { error: "Mot de passe invalide", hasAccount: false });
      }

      const creation_date = new Date().toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
      });

      const newUser = { "username": req.body.username, "password": req.body.password, "email": req.body.email, "creation" : creation_date, "xp" : 0};
      await usersCollection.insertOne(newUser);
      console.log("Nouvel utilisateur ajouté à la base de données :", req.body.username);
      req.session.username = newUser.username;
      req.session.date = newUser.creation;
      req.session.xp = newUser.xp;
      res.redirect('/'); 
    }
    else { // si tous les champs ne sont pas complétés
      return res.render('login', { error: "Veuillez remplir tous les champs", hasAccount: false });
    }
  }
  catch (err) {
    res.status(500).send("Problème avec la récup des données dans la db");
  }

});

//------------------------------------------------------------------------


app.get('/add', function (req, res) {
  if (req.session.username) { // l'utilisateur doit être connecté pour pouvoir ajouter une oeuvre
    res.render('add', { username: req.session.username, error: null });
  } else {
    res.redirect('/login');
  }

});

app.post('/add', async function (req, res) {
  try {
    if (!checkAddInput.isValidTitle(req.body.title)) {
      res.render('add', { username: req.session.username, error: "Titre invalide" })
    } 
    else if (!checkAddInput.isValidDescription(req.body.description)){
      res.render('add', { username: req.session.username, error: "Description invalide"})
    } 
    // il faudra rajouter un checkInput pour vérifier le type de l'image : termine par .png, ...
    else {    
      if (req.body.title.trim() && req.body.type && req.body.description.trim() && req.body.genres.split(',').length > 0 && req.body.date) {
        const title = req.body.title;
        const description = req.body.description;
        const genres = req.body.genres.split(','); // on réccupère les genres sur le javascript
        const date = req.body.date;
        const image = null; // il faut gérer comment accéder à l'image
        const author = req.body.author; 
      
        const newWork = {"title": title, "date": date, "author": author, "description": description, "genre": genres, "image": image, "averageRating" : 0, "reviews": []};
    
        const type = req.body.type; // pour voir dans quelle collection ajouter l'oeuvre
        if (type === "Film") {
          await moviesCollection.insertOne(newWork);
        } 
        else if (type === "Série") {
          await seriesCollection.insertOne(newWork);
        }
        console.log("Une nouvelle oeuvre a été ajouté à la base de données !");
        res.redirect("/");
    }
    else {
      res.render('add', { username: req.session.username, error: "Veuillez remplir tous les champs obligatoires." })
    }
  }
  }
  catch (err) {
    res.status(500).send("Problème avec la récup des données dans la db");
  }

});

app.get('/:title', async (req, res) => {
  const title = decodeURIComponent(req.params.title); // (Voir index.js 2e section)

  const allSeries = await dbModule.getSeries();
  const allMovies = await dbModule.getMovies();

  const movie = allMovies.find(m => m.title === title);
  const serie = allSeries.find(s => s.title === title)

  if (!movie && !serie) {
    return res.status(404).send("Film introuvable");
  }

  else if (movie) {
    res.render('oeuvre', { oeuvre : movie });
  }

  else {
    res.render ('oeuvre', { oeuvre : serie })
  }
});


//--------------------------------------------------------------------------------------------------------------------------------------

// Démarrage du serveur après initialisation de la DB
async function startServer(test) {
  try {
    const db = await dbModule.initDB();
    moviesCollection = db.moviesCollection;
    seriesCollection = db.seriesCollection;
    usersCollection = db.usersCollection;
    trophiesCollection = db.trophiesCollection;
    if (!test) { // Cela évite d'interférer avec les SuperTests
      app.listen(3000);            // Puis on démarre le serveur
      console.log("Serveur démarré sur http://localhost:3000");
    }
    return {moviesCollection, seriesCollection}
  } catch (err) {
    console.error("Erreur lors de l'initialisation de MongoDB... :", err);
  }
}

startServer(false); // test = false

module.exports = { app, startServer }; // Pour les SuperTests