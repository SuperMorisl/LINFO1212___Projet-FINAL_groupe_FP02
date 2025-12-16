const request = require("supertest");
const path = require("path"); // pour l'image de test
const fs = require("fs");
const { app, startServer } = require("../app.js");
const { closeDB } = require("../database/db.js"); 

let seriesCollection;

describe("Checking the routes", () => {

    beforeAll(async () => {
       const collections = await startServer(true); // initialise la DB sans lancer le serveur
       //moviesCollection = collections.moviesCollection; // on en a besoin ?
       seriesCollection = collections.seriesCollection;
    
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
    
    test("GET et POST /add en étant connecté sans erreur", async () => {
        const agent = request.agent(app);
    
    
        const informations = [
            "moimeme", 
            "SerieTest",  
            "Auteur Test",
            "Ceci est une description valide de plus de 20 caracteres pour le test.", 
            ["Drame"]
        ];
    
        // connexion d'un utilisateur 
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

    // nettoyage de la collection
    afterAll(async () => {
        await seriesCollection.deleteMany({ title: "SerieTest" });
        // il ne faut pas supprimer l'image de test, elle sera utilisé à chaque fois 
        await closeDB();
    });

});
