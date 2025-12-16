const request = require("supertest");
const path = require("path"); // pour l'image de test
const fs = require("fs");
const { app, startServer } = require("../app.js");
const { closeDB } = require("../database/db.js"); 

let seriesCollection;
let moviesCollection;

describe("Checking the routes", () => {

    beforeAll(async () => {
       const collections = await startServer(true); // initialise la DB sans lancer le serveur
       seriesCollection = collections.seriesCollection;
       moviesCollection = collections.moviesCollection; 
    });

    test("GET / doit rendre la page d'accueil", async () => {
        const httpRequest = await request(app).get("/");
        expect(httpRequest.statusCode).toBe(200);
    });

    test("GET /login doit rendre la page de connexion si l'utilisateur n'est pas connecté", async () => {
        const httpRequest = await request(app).get("/login");
        expect(httpRequest.statusCode).toBe(200);
    });

    test("GET /login doit rediriger vers / si l'utilisateur est connecté", async () => {
        const agent = request.agent(app);

        await agent
            .post("/login")
            .type("form")
            .send({ username: "moimeme", password: "Motdepasse123456" })
            .expect(302);

        const httpRequest = await agent.get("/login");
        expect(httpRequest.statusCode).toBe(302);
        expect(httpRequest.headers.location).toBe("/");
    });

    test("POST /login avec mot de passe correcte redirige vers la page d'accueil", async () => {
        const httpRequest = await request(app)
            .post("/login")
            .type("form")
            .send({ username: "moimeme", password: "Motdepasse123456" });

        expect(httpRequest.statusCode).toBe(302);
        expect(httpRequest.headers.location).toBe("/");
    });

    test("POST /login avec mot de passe incorrecte renvoie une erreur", async () => {
        const httpRequest = await request(app)
            .post("/login")
            .type("form")
            .send({ username: "moimeme", password: "pass123" });

        expect(httpRequest.statusCode).toBe(200);
        expect(httpRequest.text).toContain("Mot de passe incorrect");
    });

    test("POST /login avec utilisateur non-existant renvoie une erreur", async () => {
        const httpRequest = await request(app)
            .post("/login")
            .type("form")
            .send({ username: "inexistant", password: "motdepasse" });

        expect(httpRequest.statusCode).toBe(200);
        expect(httpRequest.text).toContain("Utilisateur non trouvé");
    });

    test("GET /add sans session redirige vers la page de connexion", async () => {
            const httpRequest = await request(app).get("/add");
            expect(httpRequest.statusCode).toBe(302);
            expect(httpRequest.headers.location).toBe("/login");
        });
    
    test("GET et POST /add en étant connecté sans erreur pour l'ajout d'une série", async () => {
        const agent = request.agent(app);
    
        const informations = [
            "moimeme", 
            "SerieTest",  
            "Auteur Test",
            "Ceci est une description valide de plus de 20 caracteres pour le test.", 
            ["Drame"]
        ];
    
        // connexion d'un utilisateur simulé
        await agent
            .post("/login")
            .type("form")
            .send({ username: informations[0], password: "Motdepasse123456" })
            .expect(302);
    
        const httpRequest = await agent.get("/add");
        expect(httpRequest.statusCode).toBe(200);
    
        // ajout de l'oeuvre
        const httpRequest2 = await agent
            .post("/add")
            .field('title', informations[1])
            .field('author', informations[2])
            .field('description', informations[3])
            .field('genres', informations[4].join(','))
            .field('date', "2025-12-11")
            .field('type', "Série")
            .attach('image', path.join('..', 'static', 'image', 'test.png')); // '..' sert à aller dans le dossier principale du projet
            // l'image test.png est dans static/image
        expect(httpRequest2.statusCode).toBe(302);
        expect(httpRequest2.headers.location).toBe("/");
    
        const httpRequest3 = await agent.get('/');
        expect(httpRequest3.text).toContain(informations[1]);
    });

    test("GET et POST /add en étant connecté sans erreur pour l'ajout d'un film", async () => {
        const agent = request.agent(app);
    
        const informations = [
            "moimeme", 
            "MovieTest",  
            "Auteur Test",
            "Ceci est une description valide de plus de 20 caracteres pour le test.", 
            ["Action", "Drame"]
        ];
    
        await agent
            .post("/login")
            .type("form")
            .send({ username: informations[0], password: "Motdepasse123456" })
            .expect(302);
    
        const httpRequest = await agent.get("/add");
        expect(httpRequest.statusCode).toBe(200);
    
        // ajout de l'oeuvre
        const httpRequest2 = await agent
            .post("/add")
            .field('title', informations[1])
            .field('author', informations[2])
            .field('description', informations[3])
            .field('genres', informations[4].join(','))
            .field('date', "2025-12-11")
            .field('type', "Film")
            .attach('image', path.join('..', 'static', 'image', 'test.png')); 

        expect(httpRequest2.statusCode).toBe(302);
        expect(httpRequest2.headers.location).toBe("/");
    
        const httpRequest3 = await agent.get('/');
        expect(httpRequest3.text).toContain(informations[1]);
    });

    test("POST /add en étant connecté renvoie une erreur si un des champs est incorrect", async () => { // ici on va prendre l'exemple du titre invalide 
        const agent = request.agent(app);
    
        const informations = [
            "moimeme", 
            "",  // titre vide
            "Auteur Test",
            "Ceci est une description valide de plus de 20 caracteres pour le test.", 
            ["Action", "Drame"]
        ];
    
        await agent
            .post("/login")
            .type("form")
            .send({ username: informations[0], password: "Motdepasse123456" })
            .expect(302);
    
        const httpRequest = await agent.get("/add");
        expect(httpRequest.statusCode).toBe(200);
    
        // ajout de l'oeuvre
        const httpRequest2 = await agent
            .post("/add")
            .field('title', informations[1])
            .field('author', informations[2])
            .field('description', informations[3])
            .field('genres', informations[4].join(','))
            .field('date', "2025-12-11")
            .field('type', "Film")
            .attach('image', path.join('..', 'static', 'image', 'test.png')); 

        expect(httpRequest2.statusCode).toBe(200);
        expect(httpRequest2.text).toContain("Titre invalide"); // le message d'erreur
    });

    test("GET /oeuvre/:title renvoie la page pour une série existante", async () => {
        // on ajoute une série test dans la DB
        await seriesCollection.insertOne({
            title: "SerieTestPage",
            date: "2025-12-11",
            author: "Auteur Test",
            description: "Description d'une oeuvre pour le test",
            genre: ["Drame"],
            image: "test.png",
            averageRating: 0,
            reviews: []
        });

        const httpRequest = await request(app).get("/oeuvre/SerieTestPage");
        expect(httpRequest.statusCode).toBe(200);
        expect(httpRequest.text).toContain("SerieTestPage"); // vérifier le titre
        expect(httpRequest.text).toContain("Série");         // vérifier le type
    });

    test("GET /oeuvre/:title renvoie 404 si l'oeuvre n'existe pas dans la base de données", async () => {
        const httpRequest = await request(app).get("/oeuvre/OeuvreInexistante"); // on utilise un titre qui n'existe pas
        expect(httpRequest.statusCode).toBe(404);
        expect(httpRequest.text).toContain("Film introuvable");
    });

    test("POST /review/:title redirige vers /login si non connecté", async () => { // l'utilisateur doit être connecté pour pouvoir ajouter un commentaire
        const httpRequest = await request(app)
            .post("/review/SerieTest")
            .send({ note: 4, comment: "Super série !" });

        expect(httpRequest.statusCode).toBe(302);
        expect(httpRequest.headers.location).toBe("/login");
    });

    test("POST /review/:title redirige vers l'oeuvre si avis invalide", async () => {
        const agent = request.agent(app);

        await agent
        .post("/login")
        .type("form")
        .send({ username: "moimeme", password: "Motdepasse123456" });

        // l'utilisateur ajoute son commentaire
        const httpRequest = await agent
            .post("/review/SerieTest")
            .send({ note: 3, comment: "Ok" }); // commentaire trop court --> il aurait fallut un checkInput pour le commentaire !

        expect(httpRequest.statusCode).toBe(302);
        expect(httpRequest.headers.location).toBe("/oeuvre/SerieTest");
    });

    test("POST /review/:title ajoute un avis valide et redirige vers l'oeuvre", async () => {
        const agent = request.agent(app);

        await agent
            .post("/login")
            .type("form")
            .send({ username: "moimeme", password: "Motdepasse123456" });

        // insertion temporaire d'une série pour le test
        await seriesCollection.insertOne({
            title: "SerieTest",
            author: "Auteur Test",
            description: "Description test",
            genre: ["Drame"],
            date: "2025-12-11",
            image: "test.png",
            averageRating: 0,
            reviews: []
        });
        
        // on simule un commentaire et une note valides
        const httpRequest = await agent
            .post("/review/SerieTest")
            .send({ note: 5, comment: "Super série !" });

        expect(httpRequest.statusCode).toBe(302);
        expect(httpRequest.headers.location).toBe("/oeuvre/SerieTest");
    });

    test("POST /like/:title redirige vers login si non connecté", async () => { // vérifie qu'un utilisateur non-connecté ne puisse pas liker de commentaires
        const httpRequest = await request(app)
            .post("/like/SerieTest")
            .send({ reviewUser: "autreUser" });
        // il est redirigé vers la page de connection
        expect(httpRequest.statusCode).toBe(302);
        expect(httpRequest.headers.location).toBe("/login");
    });

    test("POST /like/:title renvoie 400 si reviewUser manquant", async () => { // si on ne fournie pas l'utilisateur pour lequel on veut liker le commentaire (reviewUser), la requête est incorrecte
        const agent = request.agent(app);

        await agent
        .post("/login")
        .type("form")
        .send({ username: "moimeme", password: "Motdepasse123456" });

        const httpRequest = await agent.post("/like/SerieTest").send({}); // pas de reviewUser
        expect(httpRequest.statusCode).toBe(400);
        expect(httpRequest.text).toContain("utilisateur cible pas trouvé");
    });

    // il aurait fallut faire un test pour : "POST /like/:title redirige vers l'oeuvre si aucune erreur", mais avec la route actuelle, ce serait trop compliqué...

    test("GET /api/user/:username renvoie les infos d'un utilisateur existant", async () => { // sert à vérifier que la route renvoie bien toutes les propriétés attendues
        const username = "moimeme";

        const httpRequest = await request(app).get(`/api/user/${username}`);
    
        expect(httpRequest.statusCode).toBe(200); 
        // la réponse de la requête est sous la forme d'un fichier JSON
        // et on vérifie son contenu
        expect(httpRequest.body).toHaveProperty("username", username); 
        expect(httpRequest.body).toHaveProperty("userLevel");
        expect(httpRequest.body).toHaveProperty("userXp");
        expect(httpRequest.body).toHaveProperty("userMissions");
        expect(httpRequest.body).toHaveProperty("allTrophies");
        expect(httpRequest.body).toHaveProperty("userTrophies");
    });

    test("GET /api/user/:username renvoie 404 si utilisateur inexistant", async () => {
        const httpRequest = await request(app).get(`/api/user/inexistant`);
    
        expect(httpRequest.statusCode).toBe(404);
        expect(httpRequest.body).toHaveProperty("error", "Utilisateur introuvable");
    });

    test("GET /logout détruit la session et redirige si utilisateur connecté", async () => {
        const agent = request.agent(app);

        await agent
            .post("/login")
            .type("form")
            .send({ username: "moimeme", password: "Motdepasse123456" })
            .expect(302); 

        // on est connecté, on logout
        const httpRequest = await agent.get("/logout");
        expect(httpRequest.statusCode).toBe(302);
        expect(httpRequest.headers.location).toBe("/"); // l'utilisateur est redirigé sur la page d'accueil

        // après logout, la session doit être détruite → GET /login doit renvoyer la page de connection
        const httpRequest2 = await agent.get("/login"); // on doit se reconnecter
        expect(httpRequest2.statusCode).toBe(200);
    });

    test("GET /logout redirige vers / si utilisateur non connecté", async () => { // l'utilisateur essaye de se déconnecter alors qu'il n'est pas connecté
        const httpRequest = await request(app).get("/logout");
        expect(httpRequest.statusCode).toBe(302);
        expect(httpRequest.headers.location).toBe("/");
    });

    // nettoyage des collections après chaque test
    afterAll(async () => { 
        await seriesCollection.deleteMany({ title: "SerieTest" });
        await moviesCollection.deleteMany({ title: "MovieTest" });
        await seriesCollection.deleteMany({ title: "SerieTestPage" });
        // pas besoin de supprimer l'utilisateur "moimeme" car on suppose qu'il existe déjà dans la db test
        // il ne faut pas supprimer l'image de test, elle sera utilisé à chaque fois qu'on lance les tests
        await closeDB();
    });

});
