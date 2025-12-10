const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Connexion à la database
const client = new MongoClient("mongodb://localhost:27017");
let moviesCollection = null; // Collection movies
let seriesCollection = null; // Collection series
let usersCollection = null;
let trophiesCollection = null;


//remplit la db si la collection est vide 
async function seedCollection(collection, filePath) {
  console.log(`Tentative de lecture du fichier : ${path.resolve(filePath)}`);
  const count = await collection.countDocuments();
  if (count === 0) {
    const dataRaw = fs.readFileSync(filePath, 'utf8').trim();  //parcourt le json 
    if (!dataRaw){return;}    // Pour ne pas planter si le fichier JSON est vide
    const documents = dataRaw.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line));
    await collection.insertMany(documents);  //insertion de données clean dans la db
    console.log(`La collection '${collection.collectionName}' a bien été initialisée !`);
  }
}

// Initialisation DB + seed si vide
async function initDB() {
  await client.connect();   //connexion avec la db 
  const dbo = client.db("cest_tourne");
  moviesCollection = dbo.collection("movies");
  usersCollection = dbo.collection("users");
  seriesCollection = dbo.collection("series");
  trophiesCollection = dbo.collection("trophies");
  console.log("Connexion à MongoDB (cest_tourne) réussie !");

  await seedCollection(moviesCollection, path.join('database', 'movies.json'));
  await seedCollection(usersCollection, path.join('database', 'users.json'));
  await seedCollection(seriesCollection, path.join('database', 'series.json'));
  await seedCollection(trophiesCollection, path.join('database', 'trophies.json'));
  return { moviesCollection, seriesCollection, usersCollection, trophiesCollection };
}

//fonction générique pour récup la collection
async function getCollection(collection) {  
  if (!collection) throw new Error("La collection n'a pas été trouvée...");
  return await collection.find().toArray();
}


async function getMovies() {
  return await getCollection(moviesCollection);
}

async function getSeries() {
  return await getCollection(seriesCollection);
}


async function getTrophies() {
  return await getCollection(trophiesCollection);
}

async function getGenres() {
  const movies = await getMovies();
  const series = await getSeries();
  const genres = new Set();

  const processOeuvres = (oeuvres) => {
    for (const oeuvre of oeuvres){
      let currentGenres = oeuvre.genre;

      if(!Array.isArray(currentGenres)) {
        currentGenres = [currentGenres];
      }
      for (const genre of currentGenres){
        if (typeof genre == "string" && genre.trim().length>0){
          genres.add(genre.trim().toLowerCase());
        }
      }
    }
  };
  processOeuvres(movies);
  processOeuvres(series);

  return genres;
}

async function getUsers() {
  return await getCollection(usersCollection);
}



module.exports = { 
  initDB,  
  getMovies, 
  getSeries,
  getGenres, 
  getTrophies,
  getCollection };