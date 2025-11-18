var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require("body-parser");

const db = require('./database/db');

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

//initialisation db
(async () => {
  await db.initDB();  //utilisation de la db
  app.get('/movies', async (req, res) => {
  const movies = await db.getCollection(db.moviesCollection); //on récup tt de movies
  res.render('movies', { movies });
});
})();


app.listen(3000, () => console.log("Serveur démarré sur http://localhost:3000"));

