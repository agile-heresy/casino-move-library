function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Parentheses hold variants of a move; slashes separate alternate names for the same move.
function parseMoveName(name) {
  const match = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  const base = match ? match[1] : name;
  const variantText = match ? match[2] : null;

  const [primary, ...altNames] = base.split('/').map((part) => part.trim());
  const variants = variantText
    ? variantText.split(',').map((part) => part.trim())
    : [];

  return { primary, altNames, variants };
}

function createPanel({ dataUrl, elementSuffix, normalize }) {
  const state = {
    moves: [],
    sectionNotes: {},
    search: '',
    section: 'all',
    category: 'all',
  };

  const grid = document.getElementById(`move-grid-${elementSuffix}`);
  const emptyState = document.getElementById(`empty-state-${elementSuffix}`);
  const searchInput = document.getElementById(`search-input-${elementSuffix}`);
  const sectionFilter = document.getElementById(
    `section-filter-${elementSuffix}`,
  );
  const categoryFilter = document.getElementById(
    `category-filter-${elementSuffix}`,
  );

  function populateFilterOptions(moves) {
    const sections = [...new Set(moves.map((m) => m.section))].sort();
    const categories = [...new Set(moves.map((m) => m.category))].sort();

    for (const section of sections) {
      const option = document.createElement('option');
      option.value = section;
      option.textContent = section;
      sectionFilter.appendChild(option);
    }

    for (const category of categories) {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    }
  }

  function groupBySectionThenCategory(moves) {
    const sections = new Map();

    for (const move of moves) {
      if (!sections.has(move.section)) {
        sections.set(move.section, new Map());
      }
      const categories = sections.get(move.section);
      if (!categories.has(move.category)) {
        categories.set(move.category, []);
      }
      categories.get(move.category).push(move);
    }

    return sections;
  }

  function createSectionHeading(name) {
    const fragment = document.createDocumentFragment();

    const heading = document.createElement('h2');
    heading.className = 'section-heading';
    heading.textContent = name;
    fragment.append(heading);

    const note = state.sectionNotes[name];
    if (note) {
      const noteEl = document.createElement('p');
      noteEl.className = 'section-note';
      noteEl.textContent = note;
      fragment.append(noteEl);
    }

    return fragment;
  }

  function createCategoryHeading(name) {
    const heading = document.createElement('h3');
    heading.className = 'category-heading';
    heading.textContent = name;
    return heading;
  }

  function createMoveCard(move) {
    const card = document.createElement('article');
    card.className = 'move-card';

    const { primary, altNames, variants } = parseMoveName(move.name);

    const title = document.createElement('h4');
    title.textContent = primary;
    card.append(title);

    if (altNames.length > 0) {
      const akaEl = document.createElement('p');
      akaEl.className = 'move-aka';
      akaEl.textContent = `aka ${altNames.join(', ')}`;
      card.append(akaEl);
    }

    if (variants.length > 0) {
      const variantsEl = document.createElement('div');
      variantsEl.className = 'move-variants';

      const label = document.createElement('span');
      label.className = 'variants-label';
      label.textContent = 'Variants';
      variantsEl.append(label);

      for (const variant of variants) {
        const chip = document.createElement('span');
        chip.className = 'variant-chip';
        chip.textContent = variant;
        variantsEl.append(chip);
      }

      card.append(variantsEl);
    }

    if (move.translation) {
      const gloss = document.createElement('p');
      gloss.className = 'move-translation';

      const label = document.createElement('span');
      label.className = 'translation-label';
      label.textContent = 'EN';
      gloss.append(label);

      const text = document.createElement('span');
      text.className = 'translation-text';
      text.textContent = capitalize(move.translation);
      gloss.append(text);

      card.append(gloss);
    }

    if (move.note) {
      const note = document.createElement('p');
      note.className = 'move-note';
      note.textContent = move.note;
      card.append(note);
    }

    const videos = move.videos ?? [];
    const linkWrap = document.createElement('div');
    linkWrap.className = 'video-links';
    if (videos.length === 0) {
      const link = document.createElement('span');
      link.className = 'video-link video-link--missing';
      link.textContent = 'No video yet';
      linkWrap.append(link);
    } else {
      for (const video of videos) {
        const link = document.createElement('a');
        link.className = 'video-link';
        link.href = video.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = video.label ? `${video.label} ↗` : 'Watch video ↗';
        linkWrap.append(link);
      }
    }
    card.append(linkWrap);

    return card;
  }

  function render() {
    const query = state.search.trim().toLowerCase();

    const filtered = state.moves.filter((move) => {
      const matchesSearch = !query || move.name.toLowerCase().includes(query);
      const matchesSection =
        state.section === 'all' || move.section === state.section;
      const matchesCategory =
        state.category === 'all' || move.category === state.category;
      return matchesSearch && matchesSection && matchesCategory;
    });

    grid.innerHTML = '';
    emptyState.hidden = filtered.length !== 0;

    for (const [sectionName, categories] of groupBySectionThenCategory(
      filtered,
    )) {
      grid.appendChild(createSectionHeading(sectionName));

      for (const [categoryName, moves] of categories) {
        grid.appendChild(createCategoryHeading(categoryName));

        const cardRow = document.createElement('div');
        cardRow.className = 'move-row';
        for (const move of moves) {
          cardRow.appendChild(createMoveCard(move));
        }
        grid.appendChild(cardRow);
      }
    }
  }

  async function init() {
    const response = await fetch(dataUrl);
    const data = await response.json();
    const { moves, sectionNotes } = normalize(data);

    state.moves = moves;
    state.sectionNotes = sectionNotes;

    populateFilterOptions(state.moves);
    render();

    searchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
      render();
    });

    sectionFilter.addEventListener('change', (e) => {
      state.section = e.target.value;
      render();
    });

    categoryFilter.addEventListener('change', (e) => {
      state.category = e.target.value;
      render();
    });
  }

  init();
}

function initTabs() {
  const buttons = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('.tab-panel');

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const target = button.dataset.tab;

      for (const btn of buttons) {
        btn.classList.toggle('is-active', btn === button);
        btn.setAttribute('aria-selected', String(btn === button));
      }

      for (const panel of panels) {
        const isActive = panel.dataset.panel === target;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      }
    });
  }
}

// current library: flat array of moves with a single `video` string
createPanel({
  dataUrl: 'data/moves.json',
  elementSuffix: 'current',
  normalize: (data) => ({
    moves: data.map((move) => ({
      ...move,
      videos: move.video ? [{ url: move.video }] : [],
    })),
    sectionNotes: {},
  }),
});

// tumblr archive: { sectionNotes, moves } where moves already carry a videos array
createPanel({
  dataUrl: 'data/archive.json',
  elementSuffix: 'archive',
  normalize: (data) => ({
    moves: data.moves,
    sectionNotes: data.sectionNotes ?? {},
  }),
});

function initThemeToggle() {
  const button = document.getElementById('theme-toggle');
  const icon = button.querySelector('.theme-toggle-icon');

  function applyIcon(theme) {
    icon.innerHTML = theme === 'light' ? '&#9789;' : '&#9788;';
  }

  applyIcon(document.documentElement.getAttribute('data-theme'));

  button.addEventListener('click', () => {
    const next =
      document.documentElement.getAttribute('data-theme') === 'light'
        ? 'dark'
        : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    applyIcon(next);
  });
}

initTabs();
initThemeToggle();
