var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require("body-parser");

const checkLoginInput = require('./tests/checkLoginInput');
const checkAddInput = require('./tests/checkAddInput');

const dbModule = require('./database/db');
const {initDB, getCollection } = require('./database/db')
let usersCollection = null;
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
    const allMovies = dbModule.getMovies; //renvoi des films et séries dans la page d'accueil
    const allSeries = dbModule.getSeries;
    res.render('index', {
      username: req.session.username,
      movies: allMovies,
      series: allSeries, 
      error: null
    });
  } catch (err) {
    res.status(500).send("Problème avec la récupération des données dans la db");
  }
});


//---------------------------------------------------
//login à remodifier ?
app.get('/login', (req, res) => {
  res.render('login', { error: null, hasAccount: null }); // error permet de vérifier si le mot de passe est correct (voir dans login.ejs)
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
    res.status(500).send("Probléme avec la récup des données dans la db");
  }
});
//-----------------------------------------------------



app.get('/add', function (req, res) {
  res.render('add');
});

//--------------------------------------------------------------------------------------------------------------------------------------

// Démarrage du serveur après initialisation de la DB
async function startServer(test) {
  try {
    const db = await initDB();
    moviesCollection = db.moviesCollection;
    seriesCollection = db.seriesCollection;
    usersCollection = db.usersCollection;
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