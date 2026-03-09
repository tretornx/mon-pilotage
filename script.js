const CHECK_KEY = 'cap_simple_checks_v2';
const TEXT_KEY = 'cap_simple_texts_v2';
const COACH_KEY = 'cap_simple_coach_v2';

const coachData = {
  demarrage: {
    titre: 'Règle des 2 minutes',
    quand: 'Quand la friction empêche même le démarrage',
    duree: '2 min puis 10 min si l’élan arrive',
    qualite: 'C-Work',
    pourquoi: 'Tu ne cherches pas à finir. Tu cherches à casser l’inertie et à contourner l’évitement.',
    etapes: [
      'Réduis la tâche à une action réalisable en 120 secondes.',
      'Ouvre seulement l’outil ou le projet concerné.',
      'Écris la première sous-action visible.',
      'Si le mouvement démarre, prolonge à 10 minutes. Sinon, arrête proprement.'
    ],
    phrase: 'Je n’ai pas besoin de finir. J’ai besoin d’amorcer le mouvement.'
  },
  perfection: {
    titre: 'B-Work',
    quand: 'Quand l’attente du résultat parfait te bloque',
    duree: '25 min',
    qualite: 'B-Work',
    pourquoi: 'Le standard “A” sur chaque action détruit la vitesse. Le standard “B” crée des versions réelles et améliorables.',
    etapes: [
      'Définis ce que “suffisamment bon” veut dire pour cette session.',
      'Lance un minuteur de 25 minutes.',
      'Interdis toute correction, tout peaufinage, tout doute pendant le chrono.',
      'À la sonnerie, garde une V1 visible.'
    ],
    phrase: 'Utile maintenant vaut mieux que parfait jamais.'
  },
  dispersion: {
    titre: 'Règle 1-3-5',
    quand: 'Quand tout semble important en même temps',
    duree: '5 min',
    qualite: 'B-Work',
    pourquoi: 'La surcharge décisionnelle te paralyse. Borner le nombre de tâches réduit l’angoisse et redonne de la traction.',
    etapes: [
      'Choisis 1 Highlight unique pour la journée.',
      'Ajoute 3 tâches moyennes maximum.',
      'Ajoute 5 micro-tâches maximum.',
      'Tout le reste part au backlog.'
    ],
    phrase: 'Tout faire aujourd’hui = ne presque rien finir.'
  },
  fatigue: {
    titre: 'Tâche compatible avec ton énergie',
    quand: 'Quand l’énergie est basse ou moyenne',
    duree: '10 à 25 min',
    qualite: 'C-Work ou B-Work',
    pourquoi: 'Tu n’as pas besoin d’un meilleur moral. Tu as besoin d’une action adaptée à ton état réel.',
    etapes: [
      'Énergie basse : tri, classement, suppression, maintenance utile.',
      'Énergie moyenne : correction, rangement ciblé, sous-tâches concrètes.',
      'Énergie haute : création, code difficile, apprentissage profond.',
      'Ne force jamais une tâche A dans un état C.'
    ],
    phrase: 'Je choisis une tâche à ma portée, pas à la hauteur de mon idéal.'
  },
  culpabilite: {
    titre: 'Le Gain',
    quand: 'Quand tu te sens en retard ou “pas assez”',
    duree: '3 à 5 min',
    qualite: 'Réflexion guidée',
    pourquoi: 'Comparer à l’idéal t’épuise. Comparer au point de départ te remet en mouvement.',
    etapes: [
      'Écris 3 progrès depuis le début de semaine.',
      'Note ce qui est devenu plus clair, plus simple ou plus concret.',
      'Choisis une mini-action qui confirme cette dynamique.',
      'Ignore volontairement ton idéal futur pendant cette séquence.'
    ],
    phrase: 'Je me compare à mon point de départ, jamais à un fantasme parfait.'
  },
  tempslibre: {
    titre: 'Menu pré-approuvé',
    quand: 'Quand tu as du temps libre mais pas de direction claire',
    duree: '10 à 45 min',
    qualite: 'Selon énergie',
    pourquoi: 'Le temps libre flou appelle la distraction coupable. Un menu pré-choisi évite cette dérive.',
    etapes: [
      'Choisis dans ton menu énergie haute, moyenne ou basse.',
      'Prends une option déjà décidée, pas une nouvelle idée brillante.',
      'Lance une session finie : 10, 25 ou 45 minutes.',
      'À la fin, tu clôtures ou tu bascules vers une activité régénérante.'
    ],
    phrase: 'Le temps libre utile commence par une option déjà choisie.'
  }
};

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch (e) {
    return {};
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function refreshProgress() {
  const inputs = Array.from(document.querySelectorAll('.persist input[type="checkbox"]'));
  const total = inputs.length;
  const done = inputs.filter(input => input.checked).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  document.getElementById('doneCount').textContent = done;
  document.getElementById('allCount').textContent = total;
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('progressFill').style.width = pct + '%';

  inputs.forEach(input => {
    const item = input.closest('.check-item');
    if (!item) {
      return;
    }
    item.classList.toggle('done', input.checked);
  });
}

function initChecks() {
  const saved = readJson(CHECK_KEY);
  const inputs = document.querySelectorAll('.persist input[type="checkbox"]');

  inputs.forEach(input => {
    const id = input.dataset.id;
    input.checked = Boolean(saved[id]);

    input.addEventListener('change', () => {
      const next = readJson(CHECK_KEY);
      next[id] = input.checked;
      writeJson(CHECK_KEY, next);
      refreshProgress();
    });
  });

  refreshProgress();
}

function initTextFields() {
  const saved = readJson(TEXT_KEY);
  const fields = document.querySelectorAll('[data-text-id]');

  fields.forEach(field => {
    const id = field.dataset.textId;

    if (saved[id] !== undefined) {
      field.value = saved[id];
    }

    const eventName = field.tagName === 'SELECT' ? 'change' : 'input';

    field.addEventListener(eventName, () => {
      const next = readJson(TEXT_KEY);
      next[id] = field.value;
      writeJson(TEXT_KEY, next);
      updatePriorityDecision();
      renderCoach();
    });
  });
}

function setActiveButton(groupSelector, dataName, value) {
  document.querySelectorAll(groupSelector).forEach(btn => {
    btn.classList.toggle('active', btn.dataset[dataName] === value);
  });
}

function getTextValue(id) {
  const field = document.querySelector(`[data-text-id="${id}"]`);
  return field ? field.value.trim() : '';
}

function computeScores() {
  const priorities = [
    { key: 'priorite-1', titre: getTextValue('priorite-1') || 'Priorité 1 vide' },
    { key: 'priorite-2', titre: getTextValue('priorite-2') || 'Priorité 2 vide' },
    { key: 'priorite-3', titre: getTextValue('priorite-3') || 'Priorité 3 vide' }
  ];

  const selections = {
    urgence: getTextValue('choix-urgence'),
    importance: getTextValue('choix-importance'),
    soulagement: getTextValue('choix-soulagement'),
    levier: getTextValue('choix-levier')
  };

  priorities.forEach(item => {
    let score = 0;
    const raisons = [];

    if (selections.urgence === item.key) {
      score += 1;
      raisons.push('urgence');
    }

    if (selections.importance === item.key) {
      score += 2;
      raisons.push('importance');
    }

    if (selections.soulagement === item.key) {
      score += 1;
      raisons.push('soulagement');
    }

    if (selections.levier === item.key) {
      score += 2;
      raisons.push('levier');
    }

    item.score = score;
    item.raisons = raisons;
  });

  return priorities.sort((a, b) => b.score - a.score);
}

function updatePriorityDecision() {
  const results = computeScores();
  const container = document.getElementById('priorityResults');
  const selectedCard = document.getElementById('selectedPriorityCard');

  container.innerHTML = results.map((item, index) => {
    const selectedClass = index === 0 && item.score > 0 ? 'selected' : '';
    const raisons = item.raisons.length ? item.raisons.join(', ') : 'aucun critère choisi';

    return `
      <div class="priority-card ${selectedClass}">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
          <strong>${item.titre}</strong>
          <span class="priority-score">${item.score}</span>
        </div>
        <div class="priority-reason">Critères : ${raisons}</div>
      </div>
    `;
  }).join('');

  const top = results[0];

  if (top && top.score > 0 && !top.titre.includes('vide')) {
    selectedCard.innerHTML = `
      <strong>Priorité du jour proposée</strong><br>
      <small><strong>${top.titre}</strong><br>Elle ressort devant les autres avec un score de ${top.score}. Commence par elle aujourd’hui.</small>
    `;
  } else {
    selectedCard.innerHTML = `
      <strong>Priorité du jour</strong><br>
      <small>Complète les critères pour obtenir une proposition claire.</small>
    `;
  }
}

function getSelectedTrigger() {
  const active = document.querySelector('.trigger-btn.active');
  return active ? active.dataset.trigger : null;
}

function getSelectedEnergy() {
  const active = document.querySelector('.energy-btn.active');
  return active ? active.dataset.energy : 'moyenne';
}

function getSelectedQuality() {
  const active = document.querySelector('.score-btn.active');
  return active ? active.dataset.quality : 'B-Work';
}

function buildCoachHtml(trigger, task, energy, quality) {
  if (!trigger || !coachData[trigger]) {
    document.getElementById('sessionTarget').textContent = '25 min';

    return `
      <div class="method-card">
        <h3>Méthode conseillée</h3>
        <p class="muted">Choisis ton état réel pour afficher la méthode adaptée.</p>
      </div>
    `;
  }

  const fiche = coachData[trigger];
  const tache = task && task.trim() ? task.trim() : 'ta priorité du jour';
  let premiereAction = '';

  if (trigger === 'demarrage') {
    premiereAction = `Ouvre ${tache} et fais seulement la version 2 minutes prévue.`;
  } else if (trigger === 'perfection') {
    premiereAction = `Travaille 25 minutes sur ${tache} en visant explicitement ${quality === 'A-Work' ? 'B-Work' : quality}.`;
  } else if (trigger === 'dispersion') {
    premiereAction = `Décide si ${tache} est le Highlight du jour. Si non, renvoie-le au backlog.`;
  } else if (trigger === 'fatigue') {
    if (energy === 'haute') {
      premiereAction = `Tu peux garder ${tache} tel quel, mais borne la session.`;
    } else {
      premiereAction = `Réduis ${tache} en sous-tâche compatible avec une énergie ${energy}.`;
    }
  } else if (trigger === 'culpabilite') {
    premiereAction = `Écris 3 Gains puis lance une mini-action de 10 minutes sur ${tache}.`;
  } else if (trigger === 'tempslibre') {
    premiereAction = `Choisis une option déjà prévue liée à ${tache} ou bascule vers une vraie récupération.`;
  }

  document.getElementById('sessionTarget').textContent = fiche.duree;

  return `
    <div class="method-card">
      <h3>${fiche.titre}</h3>
      <div class="method-meta">
        <span class="chip">Quand : ${fiche.quand}</span>
        <span class="chip">Durée : ${fiche.duree}</span>
        <span class="chip">Qualité : ${fiche.qualite}</span>
      </div>
      <p>${fiche.pourquoi}</p>
    </div>
    <div class="status-card good">
      <strong>Ta première action visible</strong><br>
      <small>${premiereAction}</small>
    </div>
    <div class="method-card">
      <h3>Comment l’appliquer maintenant</h3>
      <ol class="rule-list">
        ${fiche.etapes.map(item => `<li>${item}</li>`).join('')}
      </ol>
    </div>
    <div class="status-card warn">
      <strong>Phrase anti-blocage</strong><br>
      <small>${fiche.phrase}</small>
    </div>
  `;
}

function renderCoach() {
  const savedText = readJson(TEXT_KEY);
  const coachState = readJson(COACH_KEY);
  const trigger = coachState.trigger || getSelectedTrigger();
  const energy = coachState.energy || getSelectedEnergy();
  const task = savedText['action-visible'] || savedText['jour-highlight'] || savedText['priorite-1'] || '';
  const quality = coachState.quality || getSelectedQuality();

  document.getElementById('coachOutput').innerHTML = buildCoachHtml(trigger, task, energy, quality);
}

function initCoach() {
  const coachState = readJson(COACH_KEY);

  if (coachState.trigger) {
    setActiveButton('.trigger-btn', 'trigger', coachState.trigger);
  }

  if (coachState.energy) {
    setActiveButton('.energy-btn', 'energy', coachState.energy);
  } else {
    setActiveButton('.energy-btn', 'energy', 'moyenne');
  }

  if (coachState.quality) {
    setActiveButton('.score-btn', 'quality', coachState.quality);
  } else {
    setActiveButton('.score-btn', 'quality', 'B-Work');
  }

  document.querySelectorAll('.trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.trigger-btn', 'trigger', btn.dataset.trigger);

      const next = readJson(COACH_KEY);
      next.trigger = btn.dataset.trigger;
      writeJson(COACH_KEY, next);
      renderCoach();
    });
  });

  document.querySelectorAll('.energy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.energy-btn', 'energy', btn.dataset.energy);

      const next = readJson(COACH_KEY);
      next.energy = btn.dataset.energy;
      writeJson(COACH_KEY, next);
      renderCoach();
    });
  });

  document.querySelectorAll('.score-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.score-btn', 'quality', btn.dataset.quality);

      const next = readJson(COACH_KEY);
      next.quality = btn.dataset.quality;
      writeJson(COACH_KEY, next);
      renderCoach();
    });
  });

  document.getElementById('generatePlanBtn').addEventListener('click', () => {
    const trigger = getSelectedTrigger();

    if (!trigger) {
      alert('Choisis d’abord ton état réel.');
      return;
    }

    renderCoach();
  });

  document.getElementById('resetCoachBtn').addEventListener('click', () => {
    writeJson(COACH_KEY, {});
    document.querySelectorAll('.trigger-btn, .energy-btn, .score-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    setActiveButton('.energy-btn', 'energy', 'moyenne');
    setActiveButton('.score-btn', 'quality', 'B-Work');
    renderCoach();
  });

  renderCoach();
}

initChecks();
initTextFields();
updatePriorityDecision();
initCoach();
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
