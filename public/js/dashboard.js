// Chemin : public/js/dashboard.js

// --- 1. Gestion Authentification ---
const token = localStorage.getItem('token');
const userName = localStorage.getItem('userName') || 'Pharmacien';

// Redirection si pas connecté
if (!token) {
    window.location.href = '/auth/web/login';
}

// Affichage du nom
const userDisplayElement = document.getElementById('userNameDisplay');
if (userDisplayElement) userDisplayElement.textContent = userName;

function logout() {
    localStorage.clear();
    window.location.href = '/auth/web/login';
}

// --- 2. Logique Métier (Actions) ---

// Fonction pour confirmer la disponibilité du produit ET saisir le prix
async function accepterDemande(id) {
    // 1. Demander le PRIX du médicament
    const inputPrix = prompt("Veuillez saisir le PRIX du médicament (en FCFA) pour valider :");
    
    // Si l'utilisateur clique sur Annuler
    if (inputPrix === null) return;
    
    // Validation du prix
    const prix = parseFloat(inputPrix);
    if (isNaN(prix) || prix <= 0) {
        alert("Prix invalide. Veuillez entrer un nombre correct (ex: 2500).");
        return;
    }

    // 2. Confirmation finale avant envoi
    if(!confirm(`Confirmer la vente pour ${prix} FCFA ?\n\nLe client sera notifié du total à payer (Prix Médicament + Livraison).`)) return;
    
    try {
        document.body.style.cursor = 'wait';
        
        // 3. Appel API avec le Token ET le Prix dans le body
        const reponse = await fetch(`/demandes/${id}/accepter`, { 
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', // Indispensable pour que le backend lise le body
                'Authorization': 'Bearer ' + token 
            },
            body: JSON.stringify({ prix: prix }) // On envoie l'objet { prix: 12500 }
        });

        if (reponse.ok) {
            // Rechargement pour voir le statut changer et le prix s'afficher (si géré par le template)
            window.location.reload();
        } else {
            document.body.style.cursor = 'default';
            alert("Erreur technique lors de la validation. Veuillez réessayer.");
        }
    } catch (e) {
        document.body.style.cursor = 'default';
        console.error(e);
        alert("Erreur de connexion réseau.");
    }
}

// Fonction pour assigner un livreur
async function assignerLivreur(id) {
    // Pour la démo ou MVP, on demande confirmation avant d'assigner
    if(!confirm("Voulez-vous assigner un livreur pour récupérer cette commande ?")) return;
    
    try {
        document.body.style.cursor = 'wait';
        
        // Ici, 'demo-livreur-1' est codé en dur pour l'exemple
        // Dans une V2, on pourrait choisir le livreur dans une liste
        const reponse = await fetch(`/demandes/${id}/assigner-livreur`, { 
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token 
            },
            body: JSON.stringify({ livreurId: 'demo-livreur-1' })
        });

        if (reponse.ok) {
            alert("Livreur notifié ! Le client peut suivre sa commande.");
            window.location.reload();
        } else {
            document.body.style.cursor = 'default';
            alert("Erreur lors de l'assignation du livreur.");
        }
    } catch (e) { 
        document.body.style.cursor = 'default';
        alert("Erreur réseau lors de l'assignation."); 
    }
}

// Rafraîchissement automatique toutes les 5 secondes
// Permet au pharmacien de voir les nouvelles commandes arriver sans rafraîchir manuellement
setTimeout(function(){
   window.location.reload();
}, 5000);
