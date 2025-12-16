const checkCommentInput = { // pour la page d'ajout d'un commentaire

    isValidNote : function(input) {

        const note = Number(input); // si on a "5"
        return Number.isInteger(note) && note >= 1 && note <= 5; // pour être certain que le nombre d'étoiles séléctionné est correcte
    },

    isValidComment : function(input) {

        if (typeof input !== "string") { return false; }
        const comment = input.trim(); // la ligne au dessus sert à éviter les erreurs si l'input est null ou undefined
        return comment.length >= 5 && comment.length <= 400;
    }

}

module.exports = checkCommentInput;