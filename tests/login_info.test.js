const checkuserInput = require('./checkLoginInput');

describe("Check user's username validity", () => {

    test ("Username is valid", () => {
        let username = "moimeme";
        let result = checkuserInput.isValidUsername(username);
        expect(result).toBeTruthy();
    });
    test ("Username is empty", () => {
        let username = "";
        let result = checkuserInput.isValidUsername(username);
        expect(result).toBeFalsy();
    });
    test ("Username is too short", () => {
        let username = "lol";
        let result = checkuserInput.isValidUsername(username);
        expect(result).toBeFalsy();
    });
    test ("Username is too long", () => {
        let username = "UsenameIsWayTooLongToBeValid";
        let result = checkuserInput.isValidUsername(username);
        expect(result).toBeFalsy();
    });
    test ("Username contains one invalid character", () => {
        let username = "&Username";
        let result = checkuserInput.isValidUsername(username);
        expect(result).toBeFalsy();
    });
    test ("Username constains more than one invalid character", () => {
        let username = "Jean;Michel-";
        let result = checkuserInput.isValidUsername(username);
        expect(result).toBeFalsy();
    });

});

describe("Check user's password validity", () => {
    test ("Password is valid", () => {
        let password = "Motdepasse123456";
        let result = checkuserInput.isValidPassword(password);
        expect(result).toBeTruthy();
    });
    test("Password is empty", () => {
        let password = "";
        let result = checkuserInput.isValidPassword(password);
        expect(result).toBeFalsy();
    });
    test ("Password is too short", () => {
        let password = "Pass123";
        let result = checkuserInput.isValidPassword(password);
        expect(result).toBeFalsy();
    });
    test ("Password is too long", () => {
        let password = "ThisPasswordIsWayTooLongToBeValid123";
        let result = checkuserInput.isValidPassword(password);
        expect(result).toBeFalsy();
    });
    test ("Password doesn't contain a number", () => {
        let password = "monCodeSecret";
        let result = checkuserInput.isValidPassword(password);
        expect(result).toBeFalsy();
    });
    test ("Password doesn't contain an uppercase letter", () => {
        let password = "benjamin123";
        let result = checkuserInput.isValidPassword(password);
        expect(result).toBeFalsy();
    });
    test ("Password doesn't contain a lowercase letter", () => {
        let password = "HELLOWORLD123";
        let result = checkuserInput.isValidPassword(password);
        expect(result).toBeFalsy();
    });

});

describe("Check user's e-mail validity", () => {
     test ("e-mail is valid", () => {
        let email = "name.surname@outlook.com";
        let result = checkuserInput.isValidEmail(email);
        expect(result).toBeTruthy();
    });
    test("e-mail is empty", () => {
        let email = "";
        let result = checkuserInput.isValidEmail(email);
        expect(result).toBeFalsy();
    });
    test ("e-mail starts with an invalid character", () => { // pas par une lettre ou un chiffre
        let email = "!name.surname@gmail.com";
        let result = checkuserInput.isValidEmail(email);
        expect(result).toBeFalsy();  
    });
    test ("e-mail contains at least one invalid character", () => {
        let email = "n{me.surname@hotmail.com";
        let result = checkuserInput.isValidEmail(email);
        expect(result).toBeFalsy();  
    });
    test ("e-mail finishes with anything other than the domain name", () => {
        let email = "name.surname@gmail.comA";
        let result = checkuserInput.isValidEmail(email);
        expect(result).toBeFalsy();  
    });
    test ("e-mail contains two or more consecutive dots", () => {
        let email = "name..surname@gmail.com";
        let result = checkuserInput.isValidEmail(email);
        expect(result).toBeFalsy();  
    });

});