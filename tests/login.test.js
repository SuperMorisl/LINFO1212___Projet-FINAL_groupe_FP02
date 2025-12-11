const request = require("supertest");
const { app, startServer } = require("../app.js");

describe("Checking the routes", () => {

    beforeAll(async () => {
       const collections = await startServer(true); // initialise la DB sans lancer le serveur
       //moviesCollection = collections.moviesCollection;
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

    test("GET /login doit rediriger vers /profile si l'utilisateur est connecté", async () => {
        const agent = request.agent(app);

        await agent
            .post("/login")
            .type("form")
            .send({ username: "moimeme", password: "Motdepasse123456" })
            .expect(302);

        const httpRequest = await agent.get("/login");
        expect(httpRequest.statusCode).toBe(302);
        expect(httpRequest.headers.location).toBe("/profile");
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

        const informations = {
            username: "moimeme",
            title: "SerieTest",
            author: "Auteur Test",
            description: "Desc",
            genre: ["Drame"]
        };

        // connexion
        await agent
            .post("/login")
            .type("form")
            .send({ username: informations.username, password: "Motdepasse123456" });

        const httpRequest = await agent.get("/add");
        expect(httpRequest.statusCode).toBe(200);

        // ajout de l'oeuvre
        const httpRequest2 = await agent
            .post("/add")
            .type("form")
            .send({
                title: informations.title,
                author: informations.author,
                description: informations.description,
                genres: informations.genre,
                date: "2025-12-11",
                type: "Série"
            });

        expect(httpRequest2.statusCode).toBe(302);
        expect(httpRequest2.headers.location).toBe("/");

        const httpRequest3 = await agent.get('/');
        for (const info of informations) {
            expect(httpRequest3.text).toContain(info);
        }
    });

    // nettoyage 
    afterAll(async () => {
        await seriesCollection.deleteMany({ title: "SerieTest" });
    });

});
