// On définit des noms clairs pour sauvegarder les données dans le navigateur
const CLEF_SAUVEGARDE_CASES = 'seb_pilotage_cases_v3';
const CLEF_SAUVEGARDE_TEXTES = 'seb_pilotage_textes_v3';

// Fonction simple pour lire les données enregistrées
function lireDonneesSauvegardees(clef) {
  try {
    let donneesTexte = localStorage.getItem(clef);
    if (donneesTexte === null) {
      return {}; // Si c'est vide, on renvoie un objet vide
    }
    return JSON.parse(donneesTexte);
  } catch (erreur) {
    console.log("Erreur de lecture : ", erreur);
    return {};
  }
}

// Fonction simple pour écrire les données
function sauvegarderDonnees(clef, valeur) {
  let donneesTexte = JSON.stringify(valeur);
  localStorage.setItem(clef, donneesTexte);
}

// Fonction pour mettre à jour les statistiques en haut de la page
function mettreAJourStatistiques() {
  // On récupère toutes les cases à cocher de la page
  let toutesLesCases = document.querySelectorAll('.persist input[type="checkbox"]');
  
  let nombreTotal = toutesLesCases.length;
  let nombreCochees = 0;

  // On compte combien sont cochées et on ajoute la couleur verte ("fait")
  toutesLesCases.forEach(function(caseActuelle) {
    let blocParent = caseActuelle.closest('.check-item');
    
    if (caseActuelle.checked === true) {
      nombreCochees = nombreCochees + 1;
      blocParent.classList.add('fait');
    } else {
      blocParent.classList.remove('fait');
    }
  });

  // On calcule le pourcentage sans utiliser de syntaxe compliquée
  let pourcentage = 0;
  if (nombreTotal > 0) {
    pourcentage = Math.round((nombreCochees / nombreTotal) * 100);
  }

  // On met à jour les textes et la barre de progression sur la page
  document.getElementById('compteurCochees').textContent = nombreCochees;
  document.getElementById('compteurTotal').textContent = nombreTotal;
  document.getElementById('pourcentageProgression').textContent = pourcentage + '%';
  document.getElementById('barreRemplissage').style.width = pourcentage + '%';
}

// Fonction pour initialiser les cases à cocher au chargement de la page
function initialiserCasesACocher() {
  let casesSauvegardees = lireDonneesSauvegardees(CLEF_SAUVEGARDE_CASES);
  let toutesLesCases = document.querySelectorAll('.persist input[type="checkbox"]');

  toutesLesCases.forEach(function(caseActuelle) {
    let identifiantCase = caseActuelle.dataset.id;
    
    // On remet l'état sauvegardé (vrai ou faux)
    if (casesSauvegardees[identifiantCase] === true) {
      caseActuelle.checked = true;
    } else {
      caseActuelle.checked = false;
    }

    // On écoute quand tu cliques sur une case pour sauvegarder
    caseActuelle.addEventListener('change', function() {
      let nouvellesDonnees = lireDonneesSauvegardees(CLEF_SAUVEGARDE_CASES);
      nouvellesDonnees[identifiantCase] = caseActuelle.checked;
      sauvegarderDonnees(CLEF_SAUVEGARDE_CASES, nouvellesDonnees);
      
      mettreAJourStatistiques();
    });
  });

  // On lance le calcul une première fois pour l'affichage
  mettreAJourStatistiques();
}

// Fonction pour initialiser les zones de texte (tes gains et tes actions)
function initialiserZonesDeTexte() {
  let textesSauvegardes = lireDonneesSauvegardees(CLEF_SAUVEGARDE_TEXTES);
  let tousLesChampsTexte = document.querySelectorAll('[data-text-id]');

  tousLesChampsTexte.forEach(function(champActuel) {
    let identifiantChamp = champActuel.dataset.textId;
    
    // On remet le texte que tu avais tapé
    if (textesSauvegardes[identifiantChamp] !== undefined) {
      champActuel.value = textesSauvegardes[identifiantChamp];
    } else {
      champActuel.value = '';
    }

    // On sauvegarde à chaque fois que tu tapes quelque chose
    champActuel.addEventListener('input', function() {
      let nouvellesDonnees = lireDonneesSauvegardees(CLEF_SAUVEGARDE_TEXTES);
      nouvellesDonnees[identifiantChamp] = champActuel.value;
      sauvegarderDonnees(CLEF_SAUVEGARDE_TEXTES, nouvellesDonnees);
    });
  });
}

// Lancement du système une fois que tout le code est lu
initialiserCasesACocher();
initialiserZonesDeTexte();
