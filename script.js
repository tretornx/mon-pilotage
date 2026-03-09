const CHECK_KEY = 'cap_simple_research_checks_v1';
const TEXT_KEY = 'cap_simple_research_texts_v1';
const STATE_KEY = 'cap_simple_research_state_v1';

const coachData = {
  demarrage: {
    titre: 'Règle des 15 minutes',
    quand: 'Quand la tâche numéro 1 provoque une grosse résistance',
    duree: '15 min',
    qualite: 'C-Work ou B-Work',
    pourquoi: 'Tu n’as pas besoin de promettre de terminer. Tu as juste besoin de démarrer assez petit pour contourner l’évitement.',
    etapes: [
      'Prends uniquement la tâche numéro 1.',
      'Lance un minuteur de 15 minutes.',
      'Interdis-toi de juger le résultat pendant le chrono.',
      'À la fin, tu peux soit continuer, soit t’arrêter proprement.'
    ],
    phrase: 'Je ne m’engage pas à finir. Je m’engage à commencer.'
  },
  perfection: {
    titre: 'Do It Messy + B-Work',
    quand: 'Quand tu veux produire une version parfaite',
    duree: '10 à 25 min',
    qualite: 'B-Work',
    pourquoi: 'Le brouillon imparfait est un outil thérapeutique contre le perfectionnisme déguisé.',
    etapes: [
      'Décide que la séance sert à faire un brouillon utile.',
      'Rédige ou produis une version volontairement imparfaite.',
      'Interdis le peaufinage pendant le chrono.',
      'Garde le résultat, même incomplet.'
    ],
    phrase: 'Un brouillon imparfait bat une page blanche parfaite.'
  },
  dispersion: {
    titre: 'Retour à Ivy Lee',
    quand: 'Quand tout semble prioritaire',
    duree: '5 min',
    qualite: 'B-Work',
    pourquoi: 'Le cerveau dispersé a besoin d’un ordre strict, pas d’un choix permanent.',
    etapes: [
      'Reviens à la liste de 3 à 6 tâches maximum.',
      'Choisis uniquement la prochaine tâche séquentielle.',
      'Tout le reste va dans le bac à sable ou les ressources.',
      'Continue sans rouvrir le système.'
    ],
    phrase: 'Je n’ai pas besoin de tout clarifier. J’ai besoin de suivre l’ordre.'
  },
  fatigue: {
    titre: 'Version minimale viable',
    quand: 'Quand ton énergie est basse',
    duree: '2 à 10 min',
    qualite: 'C-Work',
    pourquoi: 'Les jours difficiles doivent avoir une version de repli, sinon le système s’effondre.',
    etapes: [
      'Réduis la tâche à son geste minimal viable.',
      'Exécute seulement cette version.',
      'Accepte que la cohérence compte plus que la performance.',
      'Passe ensuite à la récupération si nécessaire.'
    ],
    phrase: 'Une petite cohérence vaut mieux qu’un grand abandon.'
  },
  culpabilite: {
    titre: 'Le Gain',
    quand: 'Quand tu te juges trop sévèrement',
    duree: '3 à 5 min',
    qualite: 'Réflexion guidée',
    pourquoi: 'Tu as besoin de recalibrer la perception de la semaine en regardant les gains réels.',
    etapes: [
      'Écris 3 gains concrets.',
      'Note ce qui est plus clair ou mieux tenu qu’avant.',
      'Choisis une mini-action de continuité.',
      'Ignore l’idéal futur pendant cette séquence.'
    ],
    phrase: 'Je me compare à mon point de départ, pas à mon idéal.'
  },
  tempslibre: {
    titre: 'Décision binaire',
    quand: 'Quand tu as du temps libre flou',
    duree: '10 à 45 min',
    qualite: 'Selon énergie',
    pourquoi: 'Le temps libre flou doit devenir soit récupération assumée, soit mini-session utile déjà choisie.',
    etapes: [
      'Décide : récupération ou mini-session utile.',
      'Si utile, prends une option déjà prévue.',
      'Borne le créneau.',
      'Clôture ensuite sans culpabilité.'
    ],
    phrase: 'Je choisis simple au lieu de rester flou.'
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
    if (!item) return;
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
      renderCoach();
    });
  });
}

function setActiveButton(selector, dataName, value) {
  document.querySelectorAll(selector).forEach(btn => {
    btn.classList.toggle('active', btn.dataset[dataName] === value);
  });
}

function getActiveValue(selector, dataName, fallbackValue) {
  const active = document.querySelector(selector + '.active');
  return active ? active.dataset[dataName] : fallbackValue;
}

function buildCoachHtml(trigger, energy, quality) {
  if (!trigger || !coachData[trigger]) {
    document.getElementById('sessionTarget').textContent = '15 min';
    return `
      <div class="method-card">
        <h3>Méthode conseillée</h3>
        <p class="muted">Choisis ton état réel à gauche.</p>
      </div>
    `;
  }

  const fiche = coachData[trigger];
  const texte = readJson(TEXT_KEY);
  const frog = (texte['frog'] || '').trim();
  const frog15 = (texte['frog-15'] || '').trim();
  const frogMessy = (texte['frog-messy'] || '').trim();
  const ivy1 = (texte['ivy-text-1'] || '').trim();
  const target = frog || ivy1 || 'ta tâche numéro 1';

  let premiereAction = '';

  if (trigger === 'demarrage') {
    premiereAction = frog15 || `Travaille 15 minutes sur : ${target}`;
  } else if (trigger === 'perfection') {
    premiereAction = frogMessy || `Fais une version imparfaite de : ${target}`;
  } else if (trigger === 'dispersion') {
    premiereAction = `Ignore tout sauf la prochaine tâche séquentielle : ${target}`;
  } else if (trigger === 'fatigue') {
    premiereAction = energy === 'basse'
      ? `Réduis ${target} à sa version minimale viable.`
      : `Garde ${target}, mais borne la séance.`;
  } else if (trigger === 'culpabilite') {
    premiereAction = `Écris 3 gains puis reviens à : ${target}`;
  } else if (trigger === 'tempslibre') {
    premiereAction = `Décide entre récupération assumée et mini-session utile liée à : ${target}`;
  }

  document.getElementById('sessionTarget').textContent = fiche.duree;

  return `
    <div class="method-card">
      <h3>${fiche.titre}</h3>
      <p><strong>Quand :</strong> ${fiche.quand}</p>
      <p><strong>Durée :</strong> ${fiche.duree}</p>
      <p><strong>Qualité :</strong> ${fiche.qualite}</p>
      <p>${fiche.pourquoi}</p>
    </div>

    <div class="status-card good">
      <strong>Première action visible</strong><br />
      <small>${premiereAction}</small>
    </div>

    <div class="method-card">
      <h3>Comment l’appliquer maintenant</h3>
      <ol>
        ${fiche.etapes.map(item => `<li>${item}</li>`).join('')}
      </ol>
    </div>

    <div class="status-card warn">
      <strong>Phrase utile</strong><br />
      <small>${fiche.phrase}</small>
    </div>
  `;
}

function renderCoach() {
  const state = readJson(STATE_KEY);
  const trigger = state.trigger || getActiveValue('.trigger-btn', 'trigger', null);
  const energy = state.energy || getActiveValue('.energy-btn', 'energy', 'moyenne');
  const quality = state.quality || getActiveValue('.quality-btn', 'quality', 'B-Work');
  document.getElementById('coachOutput').innerHTML = buildCoachHtml(trigger, energy, quality);
}

function initCoach() {
  const state = readJson(STATE_KEY);

  if (state.trigger) {
    setActiveButton('.trigger-btn', 'trigger', state.trigger);
  }
  if (state.energy) {
    setActiveButton('.energy-btn', 'energy', state.energy);
  } else {
    setActiveButton('.energy-btn', 'energy', 'moyenne');
  }
  if (state.quality) {
    setActiveButton('.quality-btn', 'quality', state.quality);
  } else {
    setActiveButton('.quality-btn', 'quality', 'B-Work');
  }

  document.querySelectorAll('.trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.trigger-btn', 'trigger', btn.dataset.trigger);
      const next = readJson(STATE_KEY);
      next.trigger = btn.dataset.trigger;
      writeJson(STATE_KEY, next);
      renderCoach();
    });
  });

  document.querySelectorAll('.energy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.energy-btn', 'energy', btn.dataset.energy);
      const next = readJson(STATE_KEY);
      next.energy = btn.dataset.energy;
      writeJson(STATE_KEY, next);
      renderCoach();
    });
  });

  document.querySelectorAll('.quality-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.quality-btn', 'quality', btn.dataset.quality);
      const next = readJson(STATE_KEY);
      next.quality = btn.dataset.quality;
      writeJson(STATE_KEY, next);
      renderCoach();
    });
  });

  document.getElementById('generatePlanBtn').addEventListener('click', () => {
    const trigger = getActiveValue('.trigger-btn', 'trigger', null);
    if (!trigger) {
      alert('Choisis d’abord ton état réel.');
      return;
    }
    renderCoach();
  });

  document.getElementById('resetCoachBtn').addEventListener('click', () => {
    writeJson(STATE_KEY, {});
    document.querySelectorAll('.trigger-btn, .energy-btn, .quality-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    setActiveButton('.energy-btn', 'energy', 'moyenne');
    setActiveButton('.quality-btn', 'quality', 'B-Work');
    renderCoach();
  });

  renderCoach();
}

initChecks();
initTextFields();
initCoach();
    duree: '5 min',
    qualite: 'B-Work',
    pourquoi: 'La surcharge décisionnelle te fait croire que tout est prioritaire. Borner redonne de la traction.',
    etapes: [
      'Choisis 1 bloc principal du jour.',
      'Ajoute 3 tâches moyennes maximum.',
      'Ajoute 5 micro-tâches maximum.',
      'Le reste part au backlog.'
    ],
    phrase: 'Tout faire aujourd’hui = se noyer.'
  },
  fatigue: {
    titre: 'Bloc d’énergie adapté',
    quand: 'Quand tu es fatigué',
    duree: '10 à 25 min',
    qualite: 'C-Work ou B-Work',
    pourquoi: 'Tu n’as pas besoin d’un meilleur état émotionnel. Tu as besoin d’une tâche compatible avec ton énergie.',
    etapes: [
      'Si énergie basse : tri, entretien, administratif simple.',
      'Si énergie moyenne : sous-tâches concrètes, corrections, rangement utile.',
      'Si énergie haute : création et réflexion profonde.',
      'Ne force pas une tâche de niveau A dans un état C.'
    ],
    phrase: 'Je choisis une tâche à ma portée réelle.'
  },
  culpabilite: {
    titre: 'Le Gain',
    quand: 'Quand tu te sens en retard',
    duree: '3 à 5 min',
    qualite: 'Réflexion guidée',
    pourquoi: 'Te comparer à l’idéal t’écrase. Te comparer au point de départ te remet en mouvement.',
    etapes: [
      'Écris 3 progrès depuis le début de semaine.',
      'Note ce qui est plus clair ou plus simple qu’avant.',
      'Choisis une mini-action qui confirme cette progression.',
      'Ignore ton idéal futur pendant cette séquence.'
    ],
    phrase: 'Je me compare à mon point de départ, pas à un fantasme.'
  },
  tempslibre: {
    titre: 'Menu pré-approuvé',
    quand: 'Quand tu as du temps libre flou',
    duree: '10 à 45 min',
    qualite: 'Selon énergie',
    pourquoi: 'Le temps libre flou appelle la distraction coupable. Un menu déjà choisi t’évite ça.',
    etapes: [
      'Choisis une option déjà prévue.',
      'Décide si tu fais une mini-session utile ou une vraie récupération.',
      'Lance un créneau borné.',
      'Clôture proprement ensuite.'
    ],
    phrase: 'Le temps libre utile commence par une décision simple.'
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
      renderCoach();
    });
  });
}

function setActiveButton(selector, dataName, value) {
  document.querySelectorAll(selector).forEach(btn => {
    btn.classList.toggle('active', btn.dataset[dataName] === value);
  });
}

function getActiveValue(selector, dataName, fallbackValue) {
  const active = document.querySelector(selector + '.active');
  return active ? active.dataset[dataName] : fallbackValue;
}

function buildCoachHtml(trigger, energy, quality) {
  if (!trigger || !coachData[trigger]) {
    document.getElementById('sessionTarget').textContent = '25 min';

    return `
      <div class="method-card">
        <h3>Méthode conseillée</h3>
        <p class="muted">Choisis ton état réel à gauche.</p>
      </div>
    `;
  }

  const fiche = coachData[trigger];
  const texte = readJson(TEXT_KEY);
  const blocPrincipal = (texte['jour-bloc-principal'] || '').trim();
  const actionVisible = (texte['jour-action-visible'] || '').trim();
  const action2min = (texte['jour-action-2min'] || '').trim();
  const frontPrincipal = (texte['jour-front-principal'] || '').trim();

  let cible = actionVisible || blocPrincipal || frontPrincipal || 'ta priorité du moment';
  let premiereAction = '';

  if (trigger === 'demarrage') {
    premiereAction = action2min || `Fais une version 2 minutes de : ${cible}.`;
  } else if (trigger === 'perfection') {
    const qualiteAffichee = quality === 'A-Work' ? 'B-Work' : quality;
    premiereAction = `Travaille sur "${cible}" en visant explicitement ${qualiteAffichee}.`;
  } else if (trigger === 'dispersion') {
    premiereAction = `Reviens à un seul bloc principal aujourd’hui : "${cible}".`;
  } else if (trigger === 'fatigue') {
    if (energy === 'basse') {
      premiereAction = `Choisis une version basse énergie de "${cible}" ou bascule sur l’entretien minimum.`;
    } else if (energy === 'moyenne') {
      premiereAction = `Réduis "${cible}" en sous-tâche simple et bornée.`;
    } else {
      premiereAction = `Tu peux garder "${cible}" si tu le bornes clairement.`;
    }
  } else if (trigger === 'culpabilite') {
    premiereAction = `Écris 3 Gains puis fais une mini-action sur "${cible}".`;
  } else if (trigger === 'tempslibre') {
    premiereAction = `Décide si tu fais une mini-session utile liée à "${cible}" ou une vraie récupération.`;
  }

  document.getElementById('sessionTarget').textContent = fiche.duree;

  return `
    <div class="method-card">
      <h3>${fiche.titre}</h3>
      <p><strong>Quand :</strong> ${fiche.quand}</p>
      <p><strong>Durée :</strong> ${fiche.duree}</p>
      <p><strong>Qualité :</strong> ${fiche.qualite}</p>
      <p>${fiche.pourquoi}</p>
    </div>

    <div class="status-card good">
      <strong>Première action visible</strong><br />
      <small>${premiereAction}</small>
    </div>

    <div class="method-card">
      <h3>Comment l’appliquer maintenant</h3>
      <ol>
        ${fiche.etapes.map(item => `<li>${item}</li>`).join('')}
      </ol>
    </div>

    <div class="status-card warn">
      <strong>Phrase utile</strong><br />
      <small>${fiche.phrase}</small>
    </div>
  `;
}

function renderCoach() {
  const state = readJson(STATE_KEY);

  const trigger = state.trigger || getActiveValue('.trigger-btn', 'trigger', null);
  const energy = state.energy || getActiveValue('.energy-btn', 'energy', 'moyenne');
  const quality = state.quality || getActiveValue('.quality-btn', 'quality', 'B-Work');

  const output = document.getElementById('coachOutput');
  output.innerHTML = buildCoachHtml(trigger, energy, quality);
}

function initCoach() {
  const state = readJson(STATE_KEY);

  if (state.trigger) {
    setActiveButton('.trigger-btn', 'trigger', state.trigger);
  }

  if (state.energy) {
    setActiveButton('.energy-btn', 'energy', state.energy);
  } else {
    setActiveButton('.energy-btn', 'energy', 'moyenne');
  }

  if (state.quality) {
    setActiveButton('.quality-btn', 'quality', state.quality);
  } else {
    setActiveButton('.quality-btn', 'quality', 'B-Work');
  }

  document.querySelectorAll('.trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.trigger-btn', 'trigger', btn.dataset.trigger);

      const next = readJson(STATE_KEY);
      next.trigger = btn.dataset.trigger;
      writeJson(STATE_KEY, next);
      renderCoach();
    });
  });

  document.querySelectorAll('.energy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.energy-btn', 'energy', btn.dataset.energy);

      const next = readJson(STATE_KEY);
      next.energy = btn.dataset.energy;
      writeJson(STATE_KEY, next);
      renderCoach();
    });
  });

  document.querySelectorAll('.quality-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.quality-btn', 'quality', btn.dataset.quality);

      const next = readJson(STATE_KEY);
      next.quality = btn.dataset.quality;
      writeJson(STATE_KEY, next);
      renderCoach();
    });
  });

  document.getElementById('generatePlanBtn').addEventListener('click', () => {
    const trigger = getActiveValue('.trigger-btn', 'trigger', null);

    if (!trigger) {
      alert('Choisis d’abord ton état réel.');
      return;
    }

    renderCoach();
  });

  document.getElementById('resetCoachBtn').addEventListener('click', () => {
    writeJson(STATE_KEY, {});
    document.querySelectorAll('.trigger-btn, .energy-btn, .quality-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    setActiveButton('.energy-btn', 'energy', 'moyenne');
    setActiveButton('.quality-btn', 'quality', 'B-Work');
    renderCoach();
  });

  renderCoach();
}

initChecks();
initTextFields();
initCoach();
