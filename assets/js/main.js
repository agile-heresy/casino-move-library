const DATA_URL = "data/moves.json";

const state = {
  moves: [],
  search: "",
  section: "all",
  category: "all",
};

const grid = document.getElementById("move-grid");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const sectionFilter = document.getElementById("section-filter");
const categoryFilter = document.getElementById("category-filter");

function populateFilterOptions(moves) {
  const sections = [...new Set(moves.map((m) => m.section))].sort();
  const categories = [...new Set(moves.map((m) => m.category))].sort();

  for (const section of sections) {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = section;
    sectionFilter.appendChild(option);
  }

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  }
}

function render() {
  const query = state.search.trim().toLowerCase();

  const filtered = state.moves.filter((move) => {
    const matchesSearch = !query || move.name.toLowerCase().includes(query);
    const matchesSection =
      state.section === "all" || move.section === state.section;
    const matchesCategory =
      state.category === "all" || move.category === state.category;
    return matchesSearch && matchesSection && matchesCategory;
  });

  grid.innerHTML = "";
  emptyState.hidden = filtered.length !== 0;

  for (const [sectionName, categories] of groupBySectionThenCategory(filtered)) {
    grid.appendChild(createSectionHeading(sectionName));

    for (const [categoryName, moves] of categories) {
      grid.appendChild(createCategoryHeading(categoryName));

      const cardRow = document.createElement("div");
      cardRow.className = "move-row";
      for (const move of moves) {
        cardRow.appendChild(createMoveCard(move));
      }
      grid.appendChild(cardRow);
    }
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
  const heading = document.createElement("h2");
  heading.className = "section-heading";
  heading.textContent = name;
  return heading;
}

function createCategoryHeading(name) {
  const heading = document.createElement("h3");
  heading.className = "category-heading";
  heading.textContent = name;
  return heading;
}

function createMoveCard(move) {
  const card = document.createElement("article");
  card.className = "move-card";

  const title = document.createElement("h4");
  title.textContent = move.name;

  const link = document.createElement("a");
  link.className = "video-link";
  if (move.video) {
    link.href = move.video;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Watch video ↗";
  } else {
    link.classList.add("video-link--missing");
    link.setAttribute("aria-disabled", "true");
    link.textContent = "No video yet";
  }

  card.append(title, link);
  return card;
}

async function init() {
  const response = await fetch(DATA_URL);
  state.moves = await response.json();

  populateFilterOptions(state.moves);
  render();

  searchInput.addEventListener("input", (e) => {
    state.search = e.target.value;
    render();
  });

  sectionFilter.addEventListener("change", (e) => {
    state.section = e.target.value;
    render();
  });

  categoryFilter.addEventListener("change", (e) => {
    state.category = e.target.value;
    render();
  });
}

init();
