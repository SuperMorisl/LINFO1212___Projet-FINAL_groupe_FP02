const checkLoginInput = {

    isValidUsername : function(input) {

        const minLength = 5;
        const maxLength = 20;
        let specialCharacters = /[!@#$%^&*()+=\[\]{}|\\;:'",.<>\/?`~-]/; // Il faut un RegEx ici (= expression régulière)
        return input.length >= minLength && input.length <= maxLength && !specialCharacters.test(input);

    },

    isValidPassword : function(input) {

        const minLength = 10;
        const maxLength = 30;
        return input.length >= minLength && input.length <= maxLength 
        && /[A-Z]/.test(input) // Le mot de passe contient au moins une majuscule 
        && /[a-z]/.test(input) // ... une minuscule
        && /\d/.test(input); // ... un chiffre

    },

    isValidEmail: function(input) {

        // format de l'e-mail :
        // elle doit commencer par un chiffre ou une lettre
        // après elle ne peut contenir que des : chiffres, lettres et -, _ ou .
        // il y a que trois domaines valides : gmail.com, outlook.com et hotmail.com (faire un test pour ça et/ou rajouter des domaines)
        // elle se finit avec le domaine
        // "!input.includes('..')" fait en sorte que deux points ne peuvent pas se succéder, ni plus

        return /^[A-Za-z0-9_][A-Za-z0-9._-]*@(gmail\.com|outlook\.com|hotmail\.com)$/.test(input) && !input.includes('..');  

    }

}

module.exports = checkLoginInput;