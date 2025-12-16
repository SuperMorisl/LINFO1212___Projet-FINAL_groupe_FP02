var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require("body-parser");


const bcrypt = require('bcrypt');  //permet d'encrypter les mdp
const multer = require("multer"); // permet de gérer les fichiers envoyés par un FORM pour pouvoir les stocker
const path = require("path");
const fs = require("fs");  //permet d'interagir avec le serv (sauvegarder des images)

// configuration de multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const saltRounds = 10; //définir le salt pr bcrypt;

const checkLoginInput = require('./tests/checkLoginInput');
const checkAddInput = require('./tests/checkAddInput');
const checkCommentInput = require('./tests/checkCommentInput');

const dbModule = require('./database/db'); // renvoie un dico avec les imports : fonctions (voir exports db.js)
const { title } = require('process');
const { Collection } = require('mongodb');


// Middleware essentiel pour parser le corps des requêtes (body) en JSON
app.use(express.json());
// Middleware pour parser les données des formulaires HTML classiques
app.use(express.urlencoded({ extended: true }));

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
app.set('views', path.join(__dirname, 'templates')); // Les fichiers html/ejs sont dans templates
app.set('view engine', 'ejs'); // On utilise ejs comme moteur de vue


//-------------------------------------------------CALCUL DE NIVEAU--------------------------------------------------------------------

function get_level(userXp){
  let level = 1;
  let leftxp = userXp;
  
  while (leftxp>=20){
    level++;
    leftxp-=20;
  }
  return {level, leftxp};
}

//-------------------------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------- LES ROUTES ----------------------------------------------------------------------

app.get('/', async function (req, res) {
  
  try {
    const allMovies = await dbModule.getMovies(); //renvoi des films et séries dans la page d'accueil
    const allSeries = await dbModule.getSeries();
    const allGenres = await dbModule.getGenres();
    const mostPopularInfo = await dbModule.getMostPopular();

    
    let currentXp = req.session.xp || 0;
    let userLevel = req.session.userLevel || 1;
    let userMissions = {"publication": 0, "commentaires":0, "visites":0};
    let userTrophies =[];

    if(req.session.username){
      const fullUser = await usersCollection.findOne({username:req.session.username});
      if (fullUser){
        userTrophies = fullUser.trophies || [];
        userMissions = fullUser.missions || userMissions;
        const {level, leftxp} = get_level(fullUser.xp || 0);
        userLevel= level;
        userXp = fullUser.xp || 0;
        
      }
    }
    const allTrophies =await dbModule.getTrophies();
    console.log("Contenu de userTrophies:", userTrophies);
    console.log("Les données des trophées sont-elles un tableau ?:", Array.isArray(userTrophies));
    res.render('index', {
      username: req.session.username,
      userDate: req.session.date,
      userXp: currentXp, 
      userLevel: userLevel,
      userMissions : userMissions,
      userTrophies: userTrophies,
      movies: allMovies,
      series: allSeries, 
      allMovies: allMovies,
      allSeries: allSeries,
      allTrophies: allTrophies,
      mostPopular : mostPopularInfo.mostPopular,
      mostPopularType : mostPopularInfo.mostPopularType,
      genres: allGenres,
      selectedFilters: {
      type: "tous",
      genre: "tous-les-genres",
      popularity: "peu-importe"
      },
      error: null
    });
  } catch (err) {
    console.error("ERREUR DÉTAILLÉE DANS LA ROUTE / :", err); // ⬅ AFFICHEZ L'ERREUR COMPLÈTE
    res.status(500).send("Problème avec la récupération des données dans la db");
  }
});

// Fonction pour la barre de recherche de la page index.ejs 
app.post('/search', async function (req, res) { // -------------------------> enlever movies et series ???
  const title = req.body.search.trim(); // on réccupère le nom du film ou de la série entré par l'utilisateur
  if (!title || title === "") {
    return res.redirect('/'); // le return sert à éviter que le reste de la fonction ne se fasse
  }

  try { // enlever series et movies 
    const allGenres = await dbModule.getGenres();
    const allSeries = await dbModule.getSeries();
    const allMovies = await dbModule.getMovies();
    const mostPopularInfo = await dbModule.getMostPopular();
    const allTrophies =await dbModule.getTrophies();

    const serie = allSeries.find(s => s.title === title);
    const movie = allMovies.find(m => m.title === title);
    const currentUser = await usersCollection.findOne({username:req.session.username});

    if (!serie && !movie) { // aucune oeuvre n'a été trouvée
      res.render('index', {
        username : req.session.username,
        userDate: req.session.date,
        userXp: req.session.xp || 0,
        userLevel: req.session.userLevel || 1,
        userMissions: currentUser ? currentUser.missions : {"publication": 0, "commentaires":0, "visites":0},
        userTrophies: currentUser ? currentUser.trophies : [],
        movies: allMovies,
        series: allSeries,
        allMovies: allMovies,
        allSeries: allSeries,
        allTrophies: allTrophies,
        mostPopular : mostPopularInfo.mostPopular,
        mostPopularType : mostPopularInfo.mostPopularType,
        genres: allGenres,
        selectedFilters: {
        type: "tous",
        genre: "tous-les-genres",
        popularity: "peu-importe"
        },
        error: "Aucune oeuvre portant ce titre n'a été trouvée."
      });
    }

    else {
      if (movie) {
        return res.redirect(`/oeuvre/${encodeURIComponent(movie.title)}`);
      }
      else {
        return res.redirect(`/oeuvre/${encodeURIComponent(serie.title)}`);
      }
    }
  }
  catch (err) {
     console.error(err);
     res.status(500).send("Erreur dans la réccupération des données");
  }
});

// Fonction pour le filtre de la page index.ejs
app.post('/filter', async function (req, res) {
  // on réccupère les inputs de l'utilisateur dans le javascript
  const type = req.body.type;           // "tous", "films", "series"
  const genre = req.body.genre.toLowerCase();
  console.log("Filtre utilisateur demandé:", genre);         // "tous-les-genres" ou ....
  const popularity = req.body.popularity; // "plus-populaire", "moins-populaire", "peu-importe"

  const allMovies = await dbModule.getMovies(); 
  const allSeries = await dbModule.getSeries();
  const allGenres = await dbModule.getGenres();
  const mostPopularInfo = await dbModule.getMostPopular();
  const allTrophies = await dbModule.getTrophies();
  const currentUser = await usersCollection.findOne({username:req.session.username});

  let filteredMovies = allMovies;
  let filteredSeries = allSeries;
  const getRating = (item) => item.averageRating ?? 0;
  // filtre en fonction du type : film ou série
  if (type === "films") {
    filteredSeries = [];   // on retire les séries
  }
  else if (type === "series") {
    filteredMovies = [];   // on retire les films
  }

  // filtre en fonction du genre
  if (genre !== "tous-les-genres") {
    const getLowercaseGenres = (oeuvre) =>{
      let genres = oeuvre.genre;

      if (!genres) return [];

      if (typeof genres ==='string'){
        genres = [genres];
      }else if(!Array.isArray(genres)){
        return [];
      }return genres.filter(g => typeof g ==='string').map(g => g.trim().toLowerCase());}
    filteredMovies = filteredMovies.filter( m=>  getLowercaseGenres(m).includes(genre));
    filteredSeries = filteredSeries.filter( s=> getLowercaseGenres(s).includes(genre))


  }

  // filtre en fonction de la popularité
  if (popularity === "plus-populaire") {
      // Tri décroissant, utilise getRating pour gérer les valeurs manquantes
      filteredMovies.sort((a, b) => getRating(b) - getRating(a)); 
      filteredSeries.sort((a, b) => getRating(b) - getRating(a));
  }
  else if (popularity === "moins-populaire") {
      // Tri croissant
      filteredMovies.sort((a, b) => getRating(a) - getRating(b));
      filteredSeries.sort((a, b) => getRating(a) - getRating(b));
  }


  res.render('index', {
    username: req.session.username,
    userDate: req.session.date,
    userXp: req.session.xp || 0,
    userLevel: req.session.userLevel || 1,
    userMissions: currentUser ? currentUser.missions : {"publication": 0, "commentaires":0, "visites":0},
    userTrophies: currentUser ? currentUser.trophies : [],
    movies: filteredMovies,
    series: filteredSeries,
    allMovies: allMovies,
    allSeries: allSeries,
    allTrophies: allTrophies,
    mostPopular : mostPopularInfo.mostPopular,
    mostPopularType : mostPopularInfo.mostPopularType,
    genres: allGenres,
    selectedFilters: {          
      type,
      genre,
      popularity
    },
    error: null
  });

});


//------------------------------------------------------------------
app.get('/login', (req, res) => {
  if (req.session.username) { // si l'utilisateur est déjà connecté
    return res.redirect('/'); // On le renvoie sur la page principale
  }
      
  return res.render('login', { error: null, hasAccount: null });  // error permet de vérifier si le mot de passe est correct (voir dans login.ejs)

});

app.post('/login', async (req, res) => {
  try {


    const actualUser = await usersCollection.findOne({ username: req.body.username }); // On réccupère l'utilisateur s'il existe dans la db
    if (!actualUser) {
      return res.render('login', { error: "Utilisateur non trouvé", hasAccount: true });
    }
    const secure = await bcrypt.compare(req.body.password, actualUser.password);
    if (secure) { // Vérification de si l'utilisateur existe dans db
      if (!actualUser.missions){
        actualUser.missions = {"publication":0, "commentaires":0,"visites":0};
      }
      actualUser.missions.visites++;
      req.session.username = req.body.username;         // Stocke le username dans la session

      let xpGained = 0;
      let newTrophies = actualUser.trophies ||[];
      let currentTotalXp = actualUser.xp || 0;
      const currentVisites = actualUser.missions.visites;

      const allTrophies = await trophiesCollection.find({category:"visites"}).toArray();
      for (const trophy of allTrophies){
        if (currentVisites>=trophy.condition&& !newTrophies.includes(trophy.id)){
          xpGained+= trophy.xp_reward;
          newTrophies.push(trophy.id);
        }
      }
      const totalXp = currentTotalXp+xpGained;


      await usersCollection.updateOne({username : req.session.username}, { $set : {missions: actualUser.missions, xp:totalXp,trophies: newTrophies}});
      const { level, leftxp } = get_level(totalXp);//calcul du niveau de l'utilisateur 
      req.session.date = actualUser.creation;
      req.session.xp = leftxp;
      req.session.userLevel = level;
      return res.redirect('/');
    }
    else if (!secure) {
      return res.render('login', { error: "Mot de passe incorrect", hasAccount: true });
    }
  }
  catch (err) {
    console.error("ERREUR DÉTAILLÉE DANS LA ROUTE /login :", err);
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

      //hashage du mdp
      let password_hashed = false;

      try{
        const salt = await bcrypt.genSalt(saltRounds);
        password_hashed = await bcrypt.hash(req.body.password, salt);
      }catch(err){
        console.log("Erreur lors du hachage du mdp", err)
      }

      const missions = {"publication":0, "commentaires":0,"visites":0};
      const newUser = { "username": req.body.username, "password": password_hashed, "email": req.body.email, "creation" : creation_date, "xp" : 0, "missions":missions, "trophies": []};
      await usersCollection.insertOne(newUser);
      console.log("Nouvel utilisateur ajouté à la base de données :", req.body.username);
      req.session.username = newUser.username;
      req.session.date = newUser.creation;
      const { level, leftxp } = get_level(newUser.xp); //calcul du niveau de l'utilisateur 
      req.session.xp = leftxp;
      req.session.userLevel = level;
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

app.post('/add', upload.single("image"), async function (req, res) { // pour que multer reçoit l'image
  try {
    if (!req.file) { // sinon il risque d'y avoir des erreurs 
      return res.render('add', { username: req.session.username, error: "Image requise" });
    }
    if (!checkAddInput.isValidTitle(req.body.title)) {
      return res.render('add', { username: req.session.username, error: "Titre invalide" });
    } 
    else if (!checkAddInput.isValidDescription(req.body.description)){
      return res.render('add', { username: req.session.username, error: "Description invalide"});
    } 
    else if (!checkAddInput.isValidImage(req.file.originalname.trim())) {
      return res.render('add', { username: req.session.username, error: "Image invalide"});
    }
    // on vérifie d'abord que le titre n'existe pas déjà dans la db
    const givenTitle = req.body.title.trim(); 

    const existingMovie = await moviesCollection.findOne({ "title": { $regex: new RegExp(`^${givenTitle}$`, "i") } }); // pour éviter d'ajouter un titre avec une majuscule et le même sans
    const existingSerie = await seriesCollection.findOne({ "title": { $regex: new RegExp(`^${givenTitle}$`, "i") } });

    if (existingMovie || existingSerie) {
      return res.render('add', { "username" : req.session.username, error: "Une œuvre portant ce titre existe déjà" });
    }

    else {    
      if (req.body.title.trim() && req.body.type && req.body.description.trim() && req.body.genres.split(',').length > 0 && req.body.date && req.file && req.body.author.trim()) { // les champs obligatoires
        
        // on stocke seulement l'image si tous les champs sont remplis
        const extension = path.extname(req.file.originalname);
        const imageName = req.file.originalname;  // nom original choisit par l'utilisateur --> vu que chaque oeuvre doit être ajoutée une seule fois 
        // buffer est utilisé pour sauvegarder le fichier seulement si tous les champs sont valides
        // on vérifie que le dossier image existe bien --> éviter que les tests échouent 
        const imageDir = path.join('..', 'static', 'image'); // '..' pour remonter à la racine du projet
        if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
        fs.writeFileSync(path.join(imageDir, imageName), req.file.buffer);

        const genres = req.body.genres.split(','); // on réccupère les genres avec le javascript
        const image = imageName; // format : image.png

        const newWork = {"title": req.body.title, "date": req.body.date, "author": req.body.author, "description": req.body.description, "genre": genres, "image": image, "averageRating" : 0, "reviews": []};
    
        const type = req.body.type; // pour voir dans quelle collection ajouter l'oeuvre
        if (type === "Film") {
          await moviesCollection.insertOne(newWork);
        } 
        else if (type === "Série") {
          await seriesCollection.insertOne(newWork);
        }
        console.log("Une nouvelle oeuvre a été ajoutée à la base de données : " + newWork.title);
        
        //mise à jour des niveaux et trophés
        const user = await usersCollection.findOne({ username: req.session.username });
        
        if (isNaN(user.xp)){
          console.warn(`XP de l'utilisateur ${user.username} était invalide (${user.xp}). Réinitialisation à 0.`);
          user.xp=0;
        }

        if (!user.missions){
          user.missions = {"publication":0, "commentaires":0,"visites":0};
        }
        user.missions.publication += 1;
        await usersCollection.updateOne({ username: req.session.username }, { $set: { missions: user.missions } });

        if (!user.trophies) user.trophies = [];
        //regarder les nouveaux trophés gagnés
        const allTrophies = await trophiesCollection.find({category:"publication"}).toArray();
        let xpGained = 0;
        for(const trophy of allTrophies){
          if(user.missions.publication >= trophy.condition && !user.trophies.includes(trophy.id)){
            xpGained += trophy.xp_reward;
            user.trophies.push(trophy.id);
            console.log(`TROPHÉE DÉBLOQUÉ pour ${user.username}: ${trophy.title}`);
          }
        }
        const totalXP = user.xp + 10+ xpGained;
        await usersCollection.updateOne({username: req.session.username}, {$set: {xp: totalXP, trophies:user.trophies}});
        //calcul nouveau niveau
        const {level, leftxp} = get_level(totalXP);
        req.session.xp = leftxp;
        req.session.userLevel = level;

        res.redirect("/");
    }
    else {
      res.render('add', { username: req.session.username, error: "Veuillez remplir tous les champs obligatoires." });
    }
  }
  }
  catch (err) {
    console.error("ERREUR DÉTAILLÉE DANS LA ROUTE /add :", err);
    res.status(500).send("Problème avec la récup des données dans la db");
  }

});

app.get('/oeuvre/:title', async (req, res) => { // pour éviter les collisions avec d'autres routes --> /add, ...
  const title = decodeURIComponent(req.params.title); // (Voir index.js 2e section)

  const allSeries = await dbModule.getSeries();
  const allMovies = await dbModule.getMovies();

  const movie = allMovies.find(m => m.title === title);
  const serie = allSeries.find(s => s.title === title);

  if (!movie && !serie) {
    return res.status(404).send("Film introuvable");
  }

  else if (movie) {
    res.render('oeuvre', { oeuvre : movie, type : "Film"});
  }

  else {
    res.render ('oeuvre', { oeuvre : serie, type: "Série"})
  }
});

app.post('/review/:title', async (req, res) => {
  if (!req.session.username){
    return res.redirect('/login');
  }
  const title = decodeURIComponent(req.params.title);
  const userNote = parseInt(req.body.note);
  const userComment = req.body.comment;
  const username = req.session.username;

  if (!checkCommentInput.isValidNote(userNote) || !checkCommentInput.isValidComment(userComment)){
    console.log("Commentaire non-vaide");
    return res.redirect(`/oeuvre/${encodeURIComponent(title)}`);
  }
  try{
    
    let collection = null;
    let oeuvre = await moviesCollection.findOne({title:title});
    
    if(oeuvre){
      collection = moviesCollection;
    }else{
      oeuvre = await seriesCollection.findOne({title:title});
      if (oeuvre){
        collection = seriesCollection;
      }
    }
    if (!oeuvre) {
             console.log(`Œuvre '${title}' non trouvée pour l'ajout d'avis.`);
             return res.status(404).send("Œuvre introuvable.");
        }

    const existingReview = oeuvre.reviews.find(r=> r.user === username);
    if ( existingReview){
      return res.redirect(`/oeuvre/${encodeURIComponent(title)}`);
    }
    if (!collection) {
            console.error("Erreur de logique: collection non définie pour une oeuvre trouvée.");
            return res.status(500).send("Erreur serveur interne.");
        }
    const newReview = {user: username, note: userNote, comment:userComment, likes: []};
    const updatedReviews = [...oeuvre.reviews, newReview];

    const totalNotes = updatedReviews.reduce((sum, review)=> sum+review.note, 0)
    const newAverageRating = (totalNotes / updatedReviews.length).toFixed(1);

    await collection.updateOne(
      {title:title},
      {$set: {reviews:updatedReviews, averageRating: parseFloat(newAverageRating)}}
    );

    const user = await usersCollection.findOne({username:username});
    if(user){
      const missions = user.missions;
      missions.commentaires++;
      
      let xpGained = 5;
      let newTrophies = user.trophies;

      const allTrophies = await trophiesCollection.find({category:"commentaires"}).toArray();
      for (const trophy of allTrophies){
        if (missions.commentaires>=trophy.condition&& !newTrophies.includes(trophy.id)){
          xpGained += trophy.xp_reward;
          newTrophies.push(trophy.id);
        }
      }
      const totalXP = user.xp+xpGained;
      const {level, leftxp} = get_level(totalXP);
      await usersCollection.updateOne(
        {username:username},{$set:{missions:missions, xp:totalXP, trophies:newTrophies}}
      );
      req.session.xp = leftxp;
      req.session.userLevel = level;
    }
    return res.redirect(`/oeuvre/${encodeURIComponent(title)}`);
  }catch (err){
    console.log("erreur détaillé dans /review", err);
    return res.status(500).send("Erreur lors de la soumission de l'avis."); // ⭐ CORRECTION: Arrêter l'exécution
  }
});

app.post('/like/:title', async (req, res) =>{
  if (!req.session.username){
    return res.redirect('/login');
  }
  const title = req.params.title;
  const reviewUser = req.body.reviewUser;
  const currentUser = req.session.user;  

  if (!reviewUser) {
        return res.status(400).send("utilisateur cible pas trouvé");
    }


  const result = await dbModule.addLikeToReview(title, reviewUser, currentUser);

  if (result.success){
    res.redirect(`/oeuvre/${encodeURIComponent(title)}`);
  }else{
    res.status(500).send(`erreur like`);
  }
  

}
);

app.get('/api/user/:username', async (req, res) => { // route special pour recupérer les infos d'un utilisateur
  try {
    const { username } = req.params;

    const user = await usersCollection.findOne({ username: username });


    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const allTrophies = await dbModule.getTrophies();
    const levelInfo = get_level(user.xp)

    res.json({
      username: user.username,
      userDate: user.creation,
      userLevel: levelInfo.level,
      userXp: levelInfo.leftxp,
      userMissions: user.missions,
      allTrophies: allTrophies,      
      userTrophies: user.trophies
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});





//-------------------------------------------------------------------------------------------------------------------------------------

app.get('/logout', function(req, res) {
  if (req.session.username){
    req.session.destroy(err=>{
      if (err){
        console.log("erreur lors de la déconnexion", err);
      }else{
        res.redirect('/');
      }
    });
  }else {
    res.redirect('/');
  }
}
);




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
    console.error("Erreur lors de l'initialisation de MongoDB... :", err);  //voir le type d'erreur exact 
    process.exit(1);
  }
}

startServer(false); // test = false

module.exports = { app, startServer }; // Pour les SuperTests