// Ce fichier sert de reinitialisation de la basse de donnée si on modifie des entrées dans les fichiers JSON
// Pour le lancer :
// sudo systemctl start mongod
// npm run reset-db

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function resetDB() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();

  const db = client.db("cest_tourne");

  const collections = {
    movies: db.collection("movies"),
    users: db.collection("users"),
    series: db.collection("series"),
    trophies: db.collection("trophies"),
  };

  console.log("Vidage des collections...");
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  function seed(collection, file) {
    const raw = fs.readFileSync(path.join("database", file), "utf8").trim();
    if (!raw) return;
    const docs = raw
      .split("\n")
      .filter(line => line.trim() !== "")
      .map(line => JSON.parse(line));
    return collection.insertMany(docs);
  }

  console.log("Réimportation des JSON...");
  await seed(collections.movies, "movies.json");
  await seed(collections.users, "users.json");
  await seed(collections.series, "series.json");
  await seed(collections.trophies, "trophies.json");

  console.log("Base de données réinitialisée avec succès !");
  await client.close();
}

resetDB();