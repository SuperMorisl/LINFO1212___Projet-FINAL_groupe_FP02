const checkAddInput = require('./checkAddInput');

describe("Check title validity", () => {
    test ("Title is valid", () => {
        let title = "Gossip Girl";
        let result = checkAddInput.isValidTitle(title);
        expect(result).toBeTruthy();
    });
    test ("Title is empty/too short", () => {
        let title = "";
        let result = checkAddInput.isValidTitle(title);
        expect(result).toBeFalsy();
    });
    test ("Title is too long", () => {
        let title = "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb";
        let result = checkAddInput.isValidTitle(title);
        expect(result).toBeFalsy();
    });
    test ("Title starts with an invalid character", () => { // ne commence pas par une lettre ou un chiffre
        let title = "& Exemple de titre incorrecte";
        let result = checkAddInput.isValidTitle(title);
        expect(result).toBeFalsy();
    });
    test ("Title contains at least one invalid character", () => {
        let title = " Exemple 2 de titre incor#recte";
        let result = checkAddInput.isValidTitle(title);
        expect(result).toBeFalsy();
    });

});

describe("Check description validity", () => {
    test ("Description is valid", () => {
        let description = "Tim et Millie sont ensemble depuis des années quand ils décident de tout abandonner pour s’installer à la campagne. Alors que les tensions sont déjà vives, une force surnaturelle transforme leur rêve en cauchemar, menaçant leur relation, leur amour… et jusqu’à leur intégrité physique.";
        let result = checkAddInput.isValidDescription(description);
        expect(result).toBeTruthy();
    });
    test ("Description is empty", () => {
        let description = "";
        let result = checkAddInput.isValidDescription(description);
        expect(result).toBeFalsy();
    });
    test ("Description is too short", () => {
        let description = "Un chien.";
        let result = checkAddInput.isValidDescription(description);
        expect(result).toBeFalsy();
    });
    test ("Description is too long", () => {
        let description = "Dans un futur proche, la société est divisée en factions strictes où chaque individu doit choisir sa voie à l’adolescence. Tris, une jeune fille issue d'une famille 'Abnégation', découvre qu’elle possède des aptitudes qui la rendent incompatible avec le monde rigide dans lequel elle a grandi. Alors qu’elle s’entraîne et apprend à maîtriser ses capacités, elle se retrouve au centre d’un conflit qui pourrait changer à jamais l’équilibre de sa société. Entre trahisons, amitiés et premiers amours, elle doit faire des choix qui testeront sa loyauté, son courage et sa capacité à rester fidèle à elle-même.";
        let result = checkAddInput.isValidDescription(description);
        expect(result).toBeFalsy();
    });

});

describe("Check image's format validity", () => {
    test ("image's format is valid", () => {
        let image = "you.png";
        let result = checkAddInput.isValidImage(image);
        expect(result).toBeTruthy();
    });
    test("image's format is valid with uppercase", () => { // la fonction dans les checkInputs va le convertir en minuscule
        let image = "photo.JPG";
        let result = checkAddInput.isValidImage(image);
        expect(result).toBeTruthy();
    });
    test ("image's extension is invalid", () => {
        let image = "you.prtf";
        let result = checkAddInput.isValidImage(image);
        expect(result).toBeFalsy();
    });
    test("image's extension is invalid", () => { // pour éviter que des fichiers .exe renommés .png passent
        let image = "photo.png.exe";
        let result = checkAddInput.isValidImage(image);
        expect(result).toBeFalsy();
    });
    test("image's name doesn't contain an extension", () => { 
        let image = "imagefile";
        let result = checkAddInput.isValidImage(image);
        expect(result).toBeFalsy();
    });
     test("image's name contains spaces", () => { 
        let image = "image file.png";
        let result = checkAddInput.isValidImage(image);
        expect(result).toBeFalsy();
    });

});