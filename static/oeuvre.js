/*lA FONCTION CI DEESOUUUUSSS EST GÉNÉRÉE PAR IA JUSTE PR TESTER DONC A MODIFIER
=================================================================================
================================================================================*/

async function handleLike(element) {
    const reviewUser = element.getAttribute('data-target-user');
    // NOTE: Assurez-vous d'utiliser la variable globale que vous avez définie !
    const oeuvreTitle = CURRENT_OEUVRE_TITLE; 

    // POINT DE CONTRÔLE 1 : Vérifier si les données envoyées sont correctes
    console.log("Envoi de la requête pour liker l'avis de:", reviewUser);
    console.log("Titre de l'oeuvre:", decodeURIComponent(oeuvreTitle)); // Décodez pour vérification

    try {
        const response = await fetch(`/like/${oeuvreTitle}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reviewUser: reviewUser })
        });

        // POINT DE CONTRÔLE 2 : Vérifier le statut de la réponse
        if (!response.ok) {
            // Si le statut n'est pas 200 (OK), il y a un problème serveur ou d'authentification
            console.error(`La requête a échoué avec le statut: ${response.status}`);
        }

        const data = await response.json();

        // POINT DE CONTRÔLE 3 : Afficher la réponse complète du serveur
        console.log("Réponse du serveur:", data);

        if (data.success) {
            // ... (votre code de mise à jour HTML ici) ...
            console.log(`Like ajouté. Nouveau nombre: ${data.newLikes}`);
        } else {
            // Afficher l'erreur retournée par la fonction addLikeToReview du dbModule
            alert(`Erreur serveur: ${data.message}`); 
            if (response.status === 401) {
                window.location.href = '/login';
            }
        }

    } catch (error) {
        console.error('Erreur réseau ou serveur inattendue:', error);
        alert("Une erreur inattendue est survenue.");
    }
}