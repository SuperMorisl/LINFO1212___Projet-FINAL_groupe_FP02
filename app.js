var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require("body-parser");

const dbModule = require('./database/db');

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

app.get('/', function (req, res) {
  try {
    res.render('index');
  }
  catch (err) {
    res.status(500).send("Problème avec la récuppération des données dans la db");
  }
});


// Démarrage du serveur après initialisation de la DB
async function startServer(test) {
  try {
    const { moviesCollection, usersCollection, seriesCollection, trophiesCollection } = await dbModule.initDB();        // On attend que la DB soit prête
    
    if (!test) { // Cela evite d'interferer avec les SuperTests
      app.listen(3000);            // Puis on démarre le serveur
      console.log("Serveur démarré sur http://localhost:3000");
    }
    return {moviesCollection, seriesCollection}
  } catch (err) {
    console.error("Erreur lors de l'initialisation de MongoDB... :", err);
  }
}

startServer(false); // test = false