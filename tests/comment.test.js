const checkCommentInput = require('./checkCommentInput');

describe("Check note validity", () => {
    
    test ("Note is valid", () => {
        let note = "4"; // la note donnée dans le formulaire est un string
        // elle va être transformée en int par la fonction checkInput avant de vérifier si elle est valide
        let result = checkCommentInput.isValidNote(note);
        expect(result).toBeTruthy();
    });

    test ("Note is lower than 1", () => {
        let note = "0";
        let result = checkCommentInput.isValidNote(note);
        expect(result).toBeFalsy();
    });

    test ("Note is higher than 5", () => {
        let note = "7";
        let result = checkCommentInput.isValidNote(note);
        expect(result).toBeFalsy();
    });

    test ("Note is a float", () => {
        let note = "3.2";
        let result = checkCommentInput.isValidNote(note);
        expect(result).toBeFalsy();
    });

    test ("Note is not a number", () => {
        let note = "abc";
        let result = checkCommentInput.isValidNote(note);
        expect(result).toBeFalsy();
    });

    test ("Note is empty", () => {
        let note = "";
        let result = checkCommentInput.isValidNote(note);
        expect(result).toBeFalsy();
    });
    
});

describe("Check comment validity", () => {

    test ("Comment is valid", () => {
        let comment = "Le film est trop bien !";
        let result = checkCommentInput.isValidComment(comment);
        expect(result).toBeTruthy();
    });

    test ("Comment is too short", () => {
        let comment = "ok.";
        let result = checkCommentInput.isValidComment(comment);
        expect(result).toBeFalsy();
    });

    test ("Comment is too long", () => {
        let comment = "Ce film est absolument incroyable ! J’ai été captivé du début à la fin, les personnages sont extrêmement bien développés, l’intrigue est pleine de rebondissements inattendus et la bande-son accompagne parfaitement chaque scène. Je n’avais jamais ressenti autant d’émotions en regardant un film auparavant. Les effets spéciaux sont époustouflants et chaque détail visuel a été soigneusement travaillé. Je recommande vivement à tous ceux qui aiment les films immersifs et profonds, car c’est une expérience que l’on n’oublie pas facilement et qui mérite d’être vue plusieurs fois pour en saisir toute la richesse et les subtilités narratives.";
        let result = checkCommentInput.isValidComment(comment);
        expect(result).toBeFalsy();
    });

    test ("Comment is null", () => {
        let comment = null;
        let result = checkCommentInput.isValidComment(comment);
        expect(result).toBeFalsy();
    });

    test ("Comment contains only spaces", () => {
        let comment = "    ";
        let result = checkCommentInput.isValidComment(comment);
        expect(result).toBeFalsy();
    });

});