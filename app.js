// State Management
let STATE = {
  xp: 0,
  level: 1,
  completed: {},
  badges: { first: false, helper: false, streak: false, creator: false },
  submissionStep: 0,
  onboardingCompleted: { welcome: false, bank: false, first: false },
  equippedDecoration: null
};

const QUESTS = [
  {
    id: 'welcome',
    type: 'onboarding',
    title: 'Welcome to Shipd',
    desc: 'Get started with your first Shipd journey',
    xp: 100,
    badge: 'first'
  },
  {
    id: 'bank-setup',
    type: 'onboarding',
    title: 'Set Up Your Bank',
    desc: 'Connect your financial institution',
    xp: 100,
    badge: 'helper'
  },
  // 'first-solution' removed as a quest; its instructions are displayed separately
  {
    id: 'explore-problems',
    type: 'contrib',
    title: 'Explore Problem Archive',
    desc: 'Browse and understand problem types',
    xp: 50
  },
  {
    id: 'solve-three',
    type: 'contrib',
    title: 'Solve 3 Problems',
    desc: 'Complete 3 problem solutions',
    xp: 100
  },
  {
    id: 'community-help',
    type: 'community',
    title: 'Help Another Contributor',
    desc: 'Assist someone in the community',
    xp: 75
  },
  {
    id: 'streak-five',
    type: 'community',
    title: 'Five Day Streak',
    desc: 'Contribute for 5 consecutive days',
    xp: 100,
    badge: 'streak'
  },
  {
    id: 'mastery-ten',
    type: 'community',
    title: 'Reach 10 Solutions',
    desc: 'Accumulate 10 problem solutions',
    xp: 100
  }
];

const CONTEXT_DATA = {
  welcome: {
    emoji: '🚀',
    title: 'Welcome to Project Jupiter',
    text: 'If you\'re seeing this, it means you were handpicked amongst the hundreds of developers based on your track record. Congrats! You\'re here because we know you can ship OSS code.\n\nProject Jupiter pays you to solve real issues in open-source repositories. Pick any existing, unmerged, unsolved, open issue from an eligible repo, claim it, solve it, and get paid. You can also pose new issues from scratch if you prefer. After a period of time, you can also raise your PR publicly!',
    hasButton: true,
    buttonText: "Lets get started!"
  },
  bank: {
    emoji: '🏦',
    title: 'Set Up Your Bank Account',
    text: 'Connect your financial institution to track your contribution rewards. This secure setup takes just 2 minutes and is required to receive payouts. Your banking information is encrypted and securely stored.\n\n<strong>Quest Progression:</strong> Complete this step to unlock contribution quests and start earning XP for your work.',
    hasButton: true,
    buttonText: "Connect with Stripe"
  },
  first: {
    emoji: '💡',
    title: 'Submit Your First Solution',
    text: 'Browse the problem archive and find a challenge that interests you. Your first solution will open doors to countless opportunities!\n\n<strong>Tips for Success:</strong>\n• Read the problem requirements carefully\n• Check the rubric for quality standards\n• Test your solution thoroughly\n• Include clear comments in your code\n\n<strong>What Happens Next:</strong>\nAfter submission, your work enters our review pipeline. You\'ll see estimated turnaround times and can track progress in real-time.',
    hasButton: true,
    buttonText: 'Start Solving'
  },
  default: {
    emoji: '⚡',
    title: 'Quest Progression & XP System',
    text: '<strong>How It Works</strong>\n\nEarn XP through completing quests and contributing solutions. Each level increases your standing in the community.\n\n<strong>Onboarding Quests (100-200 XP each):</strong>\nThese foundational quests teach you how to use Shipd and get your first solution submitted.\n\n<strong>Contribution Quests (50-300 XP):</strong>\nSolve problems, help others, and build your reputation. Higher quality work earns more XP.\n\n<strong>Leveling System:</strong>\nLevel 1: 0-200 XP\nLevel 2: 200-400 XP (you are here)\nLevel 3: 400-600 XP\nAnd beyond!\n\n<strong>Badges:</strong>\nEarn achievement badges as you progress—they signal your expertise and commitment to other contributors.',
    hasButton: false
  }
};

const DECORATION_TIERS = [
  { min: 8, className: 'decor-tier-supernova', label: 'Supernova Crest' },
  { min: 5, className: 'decor-tier-aurora', label: 'Aurora Frame' },
  { min: 3, className: 'decor-tier-comet', label: 'Comet Trail' },
  { min: 2, className: 'decor-tier-ember', label: 'Ember Halo' }
];

// Load state
function loadState() {
  const saved = localStorage.getItem('shipd-state');
  if (saved) {
    STATE = { ...STATE, ...JSON.parse(saved) };
  }
}

// Save state
function saveState() {
  localStorage.setItem('shipd-state', JSON.stringify(STATE));
}

// Calc progress within level
function calcProgress() {
  const baseXp = 100;
  const increment = 100;
    const xpForLevel = baseXp + (STATE.level - 1) * increment;
    const prevXpForLevel = STATE.level === 1 ? 0 : baseXp + (STATE.level - 2) * increment;
  const xpInLevel = STATE.xp - prevXpForLevel;
  const xpNeeded = xpForLevel - prevXpForLevel;
  const progress = Math.min(100, (xpInLevel / xpNeeded) * 100);
  return { progress, xpInLevel, xpNeeded, xpForLevel };
}

// Helper: compute progress for an arbitrary xp value
function getProgressForXp(xp) {
  const baseXp = 100;
  const increment = 100;
  // estimate level for xp
  let level = 1;
  let total = baseXp;
  while (xp >= total) {
    level++;
    total += increment;
  }
  const xpForLevel = baseXp + (level - 1) * increment;
  const prevXpForLevel = level === 1 ? 0 : baseXp + (level - 2) * increment;
  const xpInLevel = xp - prevXpForLevel;
  const xpNeeded = xpForLevel - prevXpForLevel;
  const progress = Math.min(100, (xpInLevel / xpNeeded) * 100);
  return { level, progress, xpInLevel, xpNeeded };
}

// Update progress displays
function updateProgressUI() {
  const { progress, xpInLevel, xpNeeded } = calcProgress();
  
  const xpFill = document.getElementById('xpBarFill');
  if (xpFill) xpFill.style.width = progress + '%';
  
  const xpDisplay = document.getElementById('xpDisplay');
  if (xpDisplay) xpDisplay.textContent = xpInLevel;
  
  const xpMaxDisplay = document.getElementById('xpMaxDisplay');
  if (xpMaxDisplay) xpMaxDisplay.textContent = xpNeeded;
  
  const nameDisplay = document.getElementById('userNameDisplay');
  if (nameDisplay) nameDisplay.textContent = 'Silvia';
  
  const levelDisplay = document.getElementById('userLevelDisplay');
  if (levelDisplay) levelDisplay.textContent = `Level ${STATE.level}`;
  
  const profileNameDisplay = document.getElementById('profileNameDisplay');
  if (profileNameDisplay) profileNameDisplay.textContent = 'Silvia';
  
  const profileLevelDisplay = document.getElementById('profileLevelDisplay');
  if (profileLevelDisplay) profileLevelDisplay.textContent = `Level ${STATE.level}`;

  const levelInline = document.getElementById('levelInline');
  if (levelInline) levelInline.textContent = `Level ${STATE.level}`;

  const profileLevel = document.getElementById('profileLevel');
  if (profileLevel) profileLevel.textContent = STATE.level;

  const totalXpEl = document.getElementById('totalXp');
  if (totalXpEl) totalXpEl.textContent = STATE.xp;

  updateAvatarDecorations();
  renderDecorationsPanel();
}

function unwrapAvatars() {
  document.querySelectorAll('.avatar-with-deco').forEach(wrapper => {
    const core = wrapper.querySelector('.avatar-core, .avatar-small, .avatar-large, .profile-avatar-large');
    if (core && wrapper.parentNode) {
      wrapper.parentNode.insertBefore(core, wrapper);
      wrapper.remove();
    }
  });
}

// Render quests in quest-log
function renderQuests() {
  const container = document.getElementById('quest-items');
  if (!container) return;
  
  container.innerHTML = '';

  // Consider a user 'onboarded' once they complete welcome + bank setup
  const onboarded = STATE.onboardingCompleted.welcome && STATE.onboardingCompleted.bank;
  
  QUESTS.filter(q => !STATE.completed[q.id]).forEach(quest => {
    const isCompleted = STATE.completed[quest.id];
    const isOnboardingQuest = quest.type === 'onboarding';
    const isLocked = !isOnboardingQuest && !onboarded;
    
    const item = document.createElement('div');
    item.className = 'quest-log-item';
    item.setAttribute('data-quest-id', quest.id);
    if (isCompleted) item.classList.add('completed');
    if (isLocked) item.classList.add('locked');
    
    item.innerHTML = `
      <div class="quest-log-title">
        <span>${quest.title}</span>
        <span class="quest-log-xp">${isCompleted ? '✓' : '+' + quest.xp}</span>
      </div>
    `;
    
    if (!isCompleted && !isLocked) {
      item.addEventListener('click', () => {
        completeQuest(quest.id, quest.xp, quest.badge);
        // Update context
        updateContextCard(quest.id);
      });
    }
    
    container.appendChild(item);
  });
  
  const count = QUESTS.filter(q => !STATE.completed[q.id]).length;
  const countEl = document.getElementById('questCount');
  if (countEl) countEl.textContent = `${QUESTS.length - count}/${QUESTS.length}`;
}

// Update context card based on active quest
function updateContextCard(questId) {
  const card = document.getElementById('contextCard');
  if (!card) return;
  
  let data = CONTEXT_DATA.default;
  
  if (questId === 'welcome') data = CONTEXT_DATA.welcome;
  else if (questId === 'bank-setup') data = CONTEXT_DATA.bank;
  // 'first-solution' is no longer an interactive quest; instructions are shown in the instructions box
  
  let buttonHtml = '';
  if (data.hasButton) {
    buttonHtml = `<button class="btn-context-next" data-quest="${questId}">${data.buttonText}</button>`;
  }
  
  card.innerHTML = `
    <div class="context-content">
      <div class="welcome-emoji">${data.emoji}</div>
      <h2>${data.title}</h2>
      <p>${data.text}</p>
      ${buttonHtml}
    </div>
  `;
  
  if (data.hasButton) {
    const btn = card.querySelector('.btn-context-next');
    if (btn) {
      btn.addEventListener('click', () => {
        if (questId === 'bank-setup') {
          showBankPopup();
        } else {
          completeQuestAndAdvance(questId);
        }
      });
    }
  }

  playSwap(card);
}

// Render instructions (not a quest) into the instructions box
function renderInstructions() {
  const box = document.getElementById('instructionsBox');
  if (!box) return;
  // Only show instructions after onboarding (welcome + bank) is complete
  const onboarded = STATE.onboardingCompleted && STATE.onboardingCompleted.welcome && STATE.onboardingCompleted.bank;
  if (!onboarded) {
    box.style.display = 'none';
    box.innerHTML = '';
    return;
  }
  box.style.display = 'block';
  const data = CONTEXT_DATA.first;
  // Updated instruction copy (no action button)
  box.innerHTML = `
    <h4>${data.title}</h4>
    <p>Browse the problem archive and find a challenge that interests you. Your first solution will open doors to countless opportunities!<br><br>After submission, your work enters our review pipeline. You'll see estimated turnaround times and can track progress in real-time.</p>
  `;
  playSwap(box);
}

// Complete quest with animation and advance to next
async function completeQuestAndAdvance(questId) {
  // Trigger completion flow (animation handled in completeQuest)
  await completeQuest(questId, QUESTS.find(q => q.id === questId).xp, QUESTS.find(q => q.id === questId).badge);

  const nextQuestId = getNextOnboardingQuest(questId);
  if (nextQuestId) {
    updateContextCard(nextQuestId);
  } else {
    // Onboarding complete (welcome + bank)
    updateContextCard('default');
    showChallengeCards();
  }
}

// Small helper to animate content swaps
function playSwap(el) {
  if (!el) return;
  el.classList.remove('card-swap-in');
  // force reflow to restart animation
  void el.offsetHeight;
  el.classList.add('card-swap-in');
  setTimeout(() => el.classList.remove('card-swap-in'), 520);
}

// Get next onboarding quest
function getNextOnboardingQuest(currentId) {
  const order = ['welcome', 'bank-setup'];
  const idx = order.indexOf(currentId);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

function getDecorationForLevel(level) {
  return DECORATION_TIERS.find(t => level >= t.min) || null;
}

function updateAvatarDecorations() {
  const unlocked = DECORATION_TIERS.filter(t => STATE.level >= t.min);
  const equipped = unlocked.find(t => t.className === STATE.equippedDecoration) || unlocked[0] || null;
  const classes = DECORATION_TIERS.map(t => t.className);
  document.querySelectorAll('.avatar-small, .avatar-large, .profile-avatar-large').forEach(el => {
    classes.forEach(cls => el.classList.remove(cls, 'avatar-core'));
    if (equipped) {
      el.classList.add(equipped.className);
      el.setAttribute('data-deco-label', equipped.label);
    }
    if (!equipped) el.removeAttribute('data-deco-label');
  });
}

function renderDecorationsPanel() {
  const grid = document.getElementById('decorationsGrid');
  if (!grid) return;
  const unlocked = DECORATION_TIERS.filter(t => STATE.level >= t.min);
  const equipped = STATE.equippedDecoration;
  grid.innerHTML = '';
  if (!unlocked.length) {
    grid.innerHTML = `<div class="decoration-empty">Level up to unlock avatar decorations starting at Level 2.</div>`;
    return;
  }
  unlocked.forEach(tier => {
    const card = document.createElement('button');
    card.className = `decoration-card ${tier.className} ${equipped === tier.className ? 'equipped' : ''}`;
    card.innerHTML = `
      <div class="decoration-swatch ${tier.className}"></div>
      <div class="decoration-meta">
        <div class="decoration-name">${tier.label}</div>
        <div class="decoration-req">Unlocked at Level ${tier.min}</div>
      </div>
      <div class="decoration-state">${equipped === tier.className ? 'Equipped' : 'Equip'}</div>
    `;
    card.addEventListener('click', () => {
      STATE.equippedDecoration = tier.className;
      saveState();
      updateAvatarDecorations();
      renderDecorationsPanel();
    });
    grid.appendChild(card);
  });
}

// Complete quest with a consistent sequence: XP fill -> level up -> removal
async function completeQuest(questId, xp = 0, badge) {
  if (STATE.completed[questId]) return;

  const el = document.querySelector(`.quest-log-item[data-quest-id="${questId}"]`);
  if (!el || el.dataset.completing === 'true') return;

  const container = document.querySelector('.quests-log');
  const questMeta = QUESTS.find(q => q.id === questId);

  // prevent duplicate clicks while animations run
  el.dataset.completing = 'true';
  el.classList.add('completing');

  // mark completed in state
  const prevTotalXp = STATE.xp;
  STATE.completed[questId] = true;
  if (badge) STATE.badges[badge] = true;
  if (questId === 'welcome') STATE.onboardingCompleted.welcome = true;
  if (questId === 'bank-setup') STATE.onboardingCompleted.bank = true;
  STATE.xp += xp;
  saveState();

  if (questMeta) {
    showToast(`+${xp} XP from "${questMeta.title}"`);
  }

  // Kick off removal quickly so it feels snappier, but still wait for cleanup
  const removalPromise = animateQuestRemoval(el, container);

  // Progression + level-up play in sequence
  await animateXpChange(prevTotalXp, STATE.xp);
  await maybeLevelUp();
  updateProgressUI();

  await removalPromise;

  const count = QUESTS.filter(q => !STATE.completed[q.id]).length;
  const countEl = document.getElementById('questCount');
  if (countEl) countEl.textContent = `${QUESTS.length - count}/${QUESTS.length}`;
  renderInstructions();
}

// Animate quest removal after progression + level up have finished
function animateQuestRemoval(el, container) {
  return new Promise(resolve => {
    if (!el) return resolve();

    const siblings = container ? Array.from(container.querySelectorAll('.quest-log-item')).filter(n => n !== el) : [];
    const firstRects = {};
    siblings.forEach(s => { const id = s.getAttribute('data-quest-id'); firstRects[id] = s.getBoundingClientRect(); });

    // match CSS timings
    const swipeMs = 420;
    const collapseMs = 260;
    const flipDuration = 320;
    let cleaned = false;

    // trigger swipe-out
    el.classList.add('completed');
    const startHeight = el.offsetHeight;
    el.style.height = startHeight + 'px';
    el.style.overflow = 'hidden';

    setTimeout(() => {
      if (container) container.classList.add('no-scroll');
      el.style.transition = `height ${collapseMs}ms cubic-bezier(.2,.9,.3,1), margin ${collapseMs}ms cubic-bezier(.2,.9,.3,1), padding ${collapseMs}ms cubic-bezier(.2,.9,.3,1), border 120ms ease, background 120ms ease, opacity 300ms ease`;
      el.style.margin = '0px';
      el.style.padding = '0px';
      el.style.height = '0px';
      el.style.border = '0px';
      el.style.background = 'transparent';
      el.style.opacity = '0';
      void el.offsetHeight;
    }, swipeMs);

    const finalizeRemoval = () => {
      if (cleaned) return;
      cleaned = true;
      el.removeEventListener('transitionend', onTransitionEnd);
      try { if (el.parentNode) el.parentNode.removeChild(el); } catch (e) {}

      // wait a frame so layout settles before measuring new positions
      requestAnimationFrame(() => {
        const remaining = container ? Array.from(container.querySelectorAll('.quest-log-item')) : [];
        const lastRects = {};
        remaining.forEach(r => { lastRects[r.getAttribute('data-quest-id')] = r.getBoundingClientRect(); });

        let flipCount = 0;
        remaining.forEach(r => {
          const id = r.getAttribute('data-quest-id');
          const before = firstRects[id];
          const after = lastRects[id];
          if (!before || !after) return;
          const dy = before.top - after.top;
          if (Math.abs(dy) > 0.5) {
            flipCount++;
            r.style.transform = `translateY(${dy}px)`;
            r.style.transition = `transform ${flipDuration}ms cubic-bezier(.2,.9,.3,1)`;
            void r.offsetHeight;
            r.style.transform = '';
          }
        });

        if (container) container.classList.remove('no-scroll');
        setTimeout(resolve, flipCount > 0 ? flipDuration + 80 : 120);
      });
    };

    const onTransitionEnd = (ev) => {
      if (ev && ev.propertyName && ev.propertyName !== 'height') return;
      finalizeRemoval();
    };

    el.addEventListener('transitionend', onTransitionEnd);
    setTimeout(finalizeRemoval, swipeMs + collapseMs + 280);
  });
}

// Check for level ups
function maybeLevelUp() {
  const result = getProgressForXp(STATE.xp);
  const targetLevel = result.level;

  if (targetLevel <= STATE.level) return Promise.resolve(false);

  return new Promise(resolve => {
    const stepUp = (nextTarget) => {
      if (STATE.level >= nextTarget) {
        resolve(true);
        return;
      }
      STATE.level = STATE.level + 1;
      saveState();
      updateAvatarDecorations();
      showLevelUpAnimation(STATE.level).then(() => {
        setTimeout(() => stepUp(nextTarget), 300);
      });
    };
    stepUp(targetLevel);
  });
}

// Show level up animation
function showLevelUpAnimation(level) {
  return new Promise(resolve => {
    const deco = getDecorationForLevel(level);
    const container = document.createElement('div');
    container.className = 'level-up-animation active';
    container.innerHTML = `
      <div class="level-up-content">
        <div class="level-up-text">LEVEL UP!</div>
        <div class="level-up-number">${level}</div>
        <div class="level-crest ${deco.className}"></div>
        <div class="level-badge-label">Unlocked: ${deco.label}</div>
        <div class="level-up-actions">
          <button class="btn-level-claim">Claim upgrade</button>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    const btn = container.querySelector('.btn-level-claim');
    const dismiss = () => {
      if (deco) {
        STATE.equippedDecoration = deco.className;
        saveState();
      }
      container.classList.remove('active');
      setTimeout(() => {
        container.remove();
        updateAvatarDecorations();
        renderDecorationsPanel();
        resolve();
      }, 220);
    };

    if (btn) btn.addEventListener('click', dismiss);
    container.addEventListener('click', (e) => {
      if (e.target === container) dismiss();
    });
    requestAnimationFrame(() => container.classList.add('active'));
  });
}

// Show toast
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}

// Animate XP bar and numeric change between two total-XP values
function animateXpChange(prevTotalXp, newTotalXp) {
  const xpEl = document.getElementById('xpDisplay');
  const xpBar = document.getElementById('xpBarFill');
  const prev = getProgressForXp(prevTotalXp);
  const next = getProgressForXp(newTotalXp);
  const crossesLevel = next.level > prev.level;

  const runTween = (fromProg, toProg, fromXp, toXp, duration = 700) => {
    return new Promise(resolve => {
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const currentProgress = fromProg + (toProg - fromProg) * ease;
        const currentInLevel = Math.round(fromXp + (toXp - fromXp) * ease);
        if (xpEl) xpEl.textContent = Math.max(0, currentInLevel);
        if (xpBar) xpBar.style.width = Math.max(0, Math.min(100, currentProgress)) + '%';
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  };

  // If leveling up, always show the bar filling to the end before the level animation
  if (crossesLevel) {
    return runTween(prev.progress, 100, prev.xpInLevel, prev.xpNeeded, 800);
  }

  return runTween(prev.progress, next.progress, prev.xpInLevel, next.xpInLevel, 700);
}

// Reset all data
function resetDemo() {
  if (confirm('Reset all progress? This will clear all quests and XP.')) {
    localStorage.removeItem('shipd-state');
    STATE = {
      xp: 0,
      level: 1,
      completed: {},
      badges: { first: false, helper: false, streak: false, creator: false },
      submissionStep: 0,
      onboardingCompleted: { welcome: false, bank: false, first: false }
    };
    location.reload();
  }
}

// Wire reset button
function wireResetButton() {
  const btn = document.querySelector('.btn-reset');
  if (btn) {
    btn.addEventListener('click', resetDemo);
  }
}

// Wire navigation
function wireNavigation() {
  document.querySelectorAll('.navlink').forEach(link => {
    const href = link.getAttribute('href');
    const currentPath = location.pathname;
    const isActive = currentPath.includes(href.replace('./', '')) || 
                     (href === './index.html' && currentPath.endsWith('/'));
    if (isActive) {
      link.classList.add('active');
    }
  });
  
  // Update level display on other pages
  const levelInlineEl = document.getElementById('levelInline');
  if (levelInlineEl && !levelInlineEl.textContent.includes('Level')) {
    levelInlineEl.textContent = `Level ${STATE.level}`;
  }
  
  const profileLevel = document.getElementById('profileLevel');
  if (profileLevel) {
    profileLevel.textContent = STATE.level;
  }
  
  // Update profile info on submission page
  const profileNameInline = document.getElementById('profileNameInline');
  if (profileNameInline) {
    profileNameInline.textContent = 'Silvia';
  }
}
// Show bank account popup
function showBankPopup() {
  // Build overlay using the popup classes defined in styles.css
  const overlay = document.createElement('div');
  overlay.className = 'bank-popup-overlay';

  const popup = document.createElement('div');
  popup.className = 'bank-popup';
  popup.innerHTML = `
    <div class="bank-popup-header">
      <h3>Connect your financial account</h3>
      <button class="bank-popup-close" aria-label="Close">✕</button>
    </div>
    <div class="bank-popup-content">
      <div style="text-align:center">
        <div class="stripe-logo">Stripe</div>
        <p>Connect a bank account to enable payouts and finish onboarding.</p>
        <button class="btn-bank-submit" id="connect-bank">Connect to Stripe</button>
      </div>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Wire actions
  overlay.querySelector('#connect-bank').addEventListener('click', async (e) => {
    e.preventDefault();
    // simulate success
    overlay.remove();
    await completeQuestAndAdvance('bank-setup');
    showToast('✓ Bank account connected successfully');
  });

  overlay.querySelector('.bank-popup-close').addEventListener('click', () => overlay.remove());
}

// Show challenge and problem cards after onboarding
function showChallengeCards() {
  const card = document.getElementById('contextCard');
  if (!card) return;
  
  card.classList.add('show-cards');
  card.innerHTML = `
    <div class="challenge-cards">
      <div class="challenge-card">
        <div class="challenge-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <svg viewBox="0 0 100 100" fill="none" stroke="white" stroke-width="2">
            <rect x="20" y="30" width="60" height="50" rx="4"/>
            <path d="M 35 50 L 50 65 L 65 50"/>
          </svg>
        </div>
        <h3>Solve a Challenge</h3>
        <div class="card-meta">
          <div class="card-price">$75-175 USD</div>
          <div class="card-desc">Per accepted contribution</div>
        </div>
        <button class="btn-card-start">Start</button>
      </div>
      
      <div class="challenge-card">
        <div class="challenge-image" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <svg viewBox="0 0 100 100" fill="none" stroke="white" stroke-width="2">
            <circle cx="50" cy="40" r="15"/>
            <path d="M 35 60 Q 50 75 65 60"/>
          </svg>
        </div>
        <h3>Create a Problem</h3>
        <div class="card-meta">
          <div class="card-price">$75 USD</div>
          <div class="card-desc">Per accepted contribution</div>
        </div>
        <button class="btn-card-start">Start</button>
      </div>
    </div>
  `;
  playSwap(card);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  unwrapAvatars();
  updateProgressUI();
  renderQuests();
  const onboarded = STATE.onboardingCompleted.welcome && STATE.onboardingCompleted.bank;
  if (onboarded) {
    updateContextCard('default');
    showChallengeCards();
  } else {
    updateContextCard('welcome');
  }
  renderInstructions();
  wireResetButton();
  wireNavigation();
});
