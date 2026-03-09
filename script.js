const CHECK_KEY = 'cap_simple_pilotage_checks_v3';
const TEXT_KEY = 'cap_simple_pilotage_texts_v3';
const STATE_KEY = 'cap_simple_pilotage_state_v3';

const coachData = {
  demarrage: {
    titre: 'Règle des 2 minutes',
    quand: 'Quand tu bloques avant même de commencer',
    duree: '2 min puis 10 min si ça part',
    qualite: 'C-Work',
    pourquoi: 'Tu n’as pas besoin de finir. Tu as besoin de casser l’inertie.',
    etapes: [
      'Réduis la tâche à une action ridicule mais réelle.',
      'Ouvre seulement l’outil concerné.',
      'Fais la version 2 minutes prévue.',
      'Si le mouvement part, prolonge un peu. Sinon, arrête proprement.'
    ],
    phrase: 'Je n’ai pas besoin d’être prêt. J’ai besoin d’amorcer le mouvement.'
  },
  perfection: {
    titre: 'B-Work',
    quand: 'Quand tu veux faire parfait',
    duree: '25 min',
    qualite: 'B-Work',
    pourquoi: 'Le perfectionnisme transforme une tâche utile en montagne. B-Work remet du réel.',
    etapes: [
      'Décide explicitement que la séance vise une version utile, pas finale.',
      'Lance un bloc borné.',
      'Interdis le peaufinage pendant le chrono.',
      'À la fin, garde une V1 visible.'
    ],
    phrase: 'Utile maintenant vaut mieux que parfait jamais.'
  },
  dispersion: {
    titre: 'Règle 1-3-5',
    quand: 'Quand tu veux tout faire',
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
