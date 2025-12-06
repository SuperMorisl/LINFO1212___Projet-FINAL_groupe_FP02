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
    res.render('index', {
      username: req.session.username,
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
app.post('/search', async function (req, res) {
  const title = req.body.search.trim(); // on réccupère le nom du film ou de la série

  if (!title) {
    res.redirect('/');
  }

  try {
    const allGenres = await dbModule.getGenres();
    const series = await seriesCollection.find({ title: { $regex: `^${title}$`, $options: 'i' } }).toArray();
    const movies = await moviesCollection.find({ title: { $regex: `^${title}$`, $options: 'i' } }).toArray();
    const allSeries = await dbModule.getSeries();
    const allMovies = await dbModule.getMovies();

    if (series.length === 0 && movies.length === 0) { // si aucun résultat n'a été trouvé
      res.render('index', {
        username : req.session.username,
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

app.post('/register', async function (req, res) { // séparer login et register en deux fichiers .ejs différents ???
  try {
    const user = await usersCollection.findOne({ username: req.body.username });
    if (user) {
      res.render('login', { error: "L'utilisateur existe déjà", hasAccount: false });
    }
    else if (req.body.username && req.body.password && req.body.name && req.body.email) {
      if (!checkLoginInput.isValidUsername(req.body.username)) {
        res.render('login', { error: "Nom d'utilisateur invalide", hasAccount: false });
      }
      if (!checkLoginInput.isValidEmail(req.body.email)) {
        res.render('login', { error: "Adresse email invalide", hasAccount: false });
      }
      if (!checkLoginInput.isValidPassword(req.body.password)) {
        res.render('login', { error: "Mot de passe invalide", hasAccount: false });
      }

      const newUser = { "username": req.body.username, "password": req.body.password, "name": req.body.name, "email": req.body.email };
      await usersCollection.insertOne(newUser);
      console.log("Nouvel utilisateur ajouté à la base de données :", req.body.username);
      req.session.username = req.body.username;
      res.redirect('/'); 
    }
  }
  catch (err) {
    res.status(500).send("Problème avec la récup des données dans la db");
  }

});

//------------------------------------------------------------------------


app.get('/add', function (req, res) {
  if (req.session.username) {
    res.render('add', { username: req.session.username, error: null });
  } else {
    res.redirect('/login')
  }

});

//app.post('/add', async function (req, res) { --------------------------------------> il faut rajouter les variables dans le fichier add.ejs pour que ça fonctionne
  //if (!checkAddInput.isValidTitle(req.body.title)) {
    //res.render('add', { username: req.session.username, error: "Titre invalide" })
  //} 
  //else if (!checkAddInput.isValidDescription(req.body.description)){
    //res.render('add', { username: req.session.username, error: "Description invalide"})
  //} 
  //else {                  // rajouter les acteurs ???
    //req.session.title = req.body.title;
    //req.session.date = req.body.date;
    //req.session.author = req.body.author;
    //req.session.description = req.body.description;
    //req.session.genre = req.body.genre;
    //req.session.image = req.body.image;
    //const newWork = {"title": req.session.title, "date": req.session.date, "author": req.session.author, "description": req.session.description, "genre": req.session.genre, "image": req.session.image};
    //const type = req.body.type; // un film ou une serie
    //if (type === "Film") {
      //await moviesCollection.insertOne(newWork);
    //} 
    //else if (type === "Serie") {
      //await seriesCollection.insertOne(newWork);
    //}
    //console.log("Une nouvelle oeuvre a été ajouté à la base de données !");
    //res.redirect("/");
 //}
//});

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