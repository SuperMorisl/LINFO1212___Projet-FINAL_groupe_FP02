const checkAddInput = {

    isValidTitle : function(input) {

        const minLength = 1;
        const maxLength = 50;
        const val = input.trim(); // On enlève les espaces au début et à la fin
        const specialCharacters = /[!@#$%^&*()+=\[\]{}|\\;:"<>\/?`~]/;
        return val.length >= minLength && val.length <= maxLength && !specialCharacters.test(val) 
        && /^[\w\d].*/.test(val); // Vérifie que le titre commence par une lettre ou un chiffre

    },

    isValidDescription : function(input) {

        const minLength = 20;
        const maxLength = 400;
        const val = input.trim();
        return val.length >= minLength && val.length <= maxLength;

    },

    isValidImage: function(input) {

    const correctFormats = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".svg"]; // les formats acceptés
    const lower = input.toLowerCase(); // pour éviter les problèmes de majuscules
    return correctFormats.some(ext => lower.endsWith(ext)); // Array.some()

    } 

}

module.exports = checkAddInput;