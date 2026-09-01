function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function scrollToHashTarget() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  const panel = target.closest('.tab-panel');
  if (panel) {
    const tabName = panel.dataset.panel;
    const button = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    if (button && !button.classList.contains('is-active')) {
      button.click();
    }
  }

  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('move-card--highlight');
    setTimeout(() => target.classList.remove('move-card--highlight'), 2500);
  });
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

  function compareStrings(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  }

  function populateFilterOptions(moves) {
    const sections = [...new Set(moves.map((m) => m.section))].sort(
      compareStrings,
    );
    const categories = [...new Set(moves.map((m) => m.category))].sort(
      compareStrings,
    );

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
    const sortedMoves = [...moves].sort((a, b) =>
      compareStrings(a.name, b.name),
    );

    for (const move of sortedMoves) {
      if (!sections.has(move.section)) {
        sections.set(move.section, new Map());
      }
      const categories = sections.get(move.section);
      if (!categories.has(move.category)) {
        categories.set(move.category, []);
      }
      categories.get(move.category).push(move);
    }

    const orderedSections = [...sections.entries()].sort(([left], [right]) =>
      compareStrings(left, right),
    );
    const ordered = new Map();

    for (const [sectionName, categories] of orderedSections) {
      const orderedCategories = new Map();
      const sortedCategories = [...categories.entries()].sort(
        ([left], [right]) => compareStrings(left, right),
      );

      for (const [categoryName, categoryMoves] of sortedCategories) {
        orderedCategories.set(
          categoryName,
          [...categoryMoves].sort((left, right) =>
            compareStrings(left.name, right.name),
          ),
        );
      }

      ordered.set(sectionName, orderedCategories);
    }

    return ordered;
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
    card.id = move._id;

    const shareButton = document.createElement('button');
    shareButton.type = 'button';
    shareButton.className = 'share-button';
    shareButton.setAttribute('aria-label', 'Copy link to this move');
    shareButton.textContent = '🔗';
    shareButton.addEventListener('click', () => {
      const url = `${location.origin}${location.pathname}#${move._id}`;
      history.replaceState(null, '', `#${move._id}`);
      navigator.clipboard?.writeText(url).then(
        () => {
          shareButton.textContent = '✓';
          setTimeout(() => (shareButton.textContent = '🔗'), 1500);
        },
        () => {},
      );
    });
    card.append(shareButton);

    const altNames = move.altNames ?? [];
    const variants = move.variants ?? [];

    const title = document.createElement('h4');
    title.textContent = move.name;
    card.append(title);

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

    if (altNames.length > 0) {
      const akaEl = document.createElement('div');
      akaEl.className = 'move-aka';

      const label = document.createElement('span');
      label.className = 'aka-label';
      label.textContent = 'Also known as';
      akaEl.append(label);

      const list = document.createElement('ul');
      list.className = 'aka-list';
      for (const alt of altNames) {
        const item = document.createElement('li');
        item.className = 'aka-item';

        const itemName = document.createElement('span');
        itemName.className = 'aka-item-name';
        itemName.textContent = alt.name;
        item.append(itemName);

        if (alt.translation) {
          const itemTranslation = document.createElement('span');
          itemTranslation.className = 'aka-item-translation';
          itemTranslation.textContent = alt.translation;
          item.append(itemTranslation);
        }

        list.append(item);
      }
      akaEl.append(list);

      card.append(akaEl);
    }

    if (variants.length > 0) {
      const variantsWrap = document.createElement('div');
      variantsWrap.className = 'move-variants';

      const label = document.createElement('span');
      label.className = 'variants-label';
      label.textContent = 'Variants';
      variantsWrap.append(label);

      const list = document.createElement('ul');
      list.className = 'variant-list';
      for (const variant of variants) {
        const item = document.createElement('li');
        item.className = 'variant-item';

        const itemName = document.createElement('span');
        itemName.className = 'variant-item-name';
        itemName.textContent = variant.name;
        item.append(itemName);

        if (variant.translation) {
          const itemTranslation = document.createElement('span');
          itemTranslation.className = 'variant-item-translation';
          itemTranslation.textContent = variant.translation;
          item.append(itemTranslation);
        }

        list.append(item);
      }
      variantsWrap.append(list);

      card.append(variantsWrap);
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
    const rawData = Array.isArray(dataUrl)
      ? (
          await Promise.all(
            dataUrl.map(async (source) => {
              const url = typeof source === 'string' ? source : source.url;
              const response = await fetch(url);
              const data = await response.json();
              return source.section
                ? data.map((move) => ({ ...move, section: source.section }))
                : data;
            }),
          )
        ).flat()
      : await (await fetch(dataUrl)).json();

    const { moves, sectionNotes } = normalize(rawData);

    state.moves = moves.map((move, index) => ({
      ...move,
      _id: `${elementSuffix}-${index}-${slugify(move.name)}`,
    }));
    state.sectionNotes = sectionNotes;

    populateFilterOptions(state.moves);
    render();
    scrollToHashTarget();

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
  dataUrl: [
    {
      url: 'data/sections/partnerwork-moves.json',
      section: 'Partnerwork Moves',
    },
    { url: 'data/sections/rueda-moves.json', section: 'Rueda Moves' },
    {
      url: 'data/sections/rueda-structures.json',
      section: 'Rueda Structures',
    },
  ],
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

window.addEventListener('hashchange', scrollToHashTarget);

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
