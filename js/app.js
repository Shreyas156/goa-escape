// ===================================================
// GOA ESCAPE - CLIENT JAVASCRIPT APPLICATION
// Interactive Search, Region/Category Filtering, Maps Integration
// ===================================================

import { 
  GOA_SPOTS, 
  GOA_ITINERARIES, 
  GOA_TRAVEL_TIPS,
  GOA_CAFES_DIRECTORY,
  GOA_STAYS_DIRECTORY,
  GOA_NIGHTLIFE_AND_CASINOS,
  GOA_ACTIVITIES_AND_MARKETS,
  GOA_SIGHTSEEING_DIRECTORY 
} from './data.js';

// Application State
const state = {
  selectedRegion: 'all',     // 'all' | 'north' | 'south'
  selectedCategory: 'all',   // 'all' | 'insta-famous' | 'beaches' | ...
  searchQuery: '',
  sortBy: 'featured',
  savedSpotIds: JSON.parse(localStorage.getItem('goa_saved_spots') || '[]'),
  currentItineraryId: GOA_ITINERARIES[0].id,
  selectedCafeArea: 'all',
  activeStayType: 'hotels',
  activeSightseeingTab: 'churches',
  theme: localStorage.getItem('goa_theme') || 'dark'
};

// DOM Element Selectors
const elements = {
  spotsGrid: document.getElementById('spotsGrid'),
  searchInput: document.getElementById('searchInput'),
  regionBtns: document.querySelectorAll('.region-btn'),
  categoryPills: document.querySelectorAll('.category-pill'),
  sortSelect: document.getElementById('sortSelect'),
  visibleSpotsCount: document.getElementById('visibleSpotsCount'),
  totalSpotsCount: document.getElementById('totalSpotsCount'),
  tripCountBadge: document.getElementById('tripCountBadge'),
  btnOpenTrip: document.getElementById('btnOpenTrip'),
  tripDrawer: document.getElementById('tripDrawer'),
  drawerBackdrop: document.getElementById('drawerBackdrop'),
  btnCloseDrawer: document.getElementById('btnCloseDrawer'),
  drawerBody: document.getElementById('drawerBody'),
  btnClearTrip: document.getElementById('btnClearTrip'),
  btnOpenAllInMaps: document.getElementById('btnOpenAllInMaps'),
  spotModalBackdrop: document.getElementById('spotModalBackdrop'),
  spotModal: document.getElementById('spotModal'),
  itinTabs: document.getElementById('itinTabs'),
  itinDisplay: document.getElementById('itinDisplay'),
  cafesFilterPills: document.getElementById('cafesFilterPills'),
  cafesGrid: document.getElementById('cafesGrid'),
  casinosGrid: document.getElementById('casinosGrid'),
  partiesGrid: document.getElementById('partiesGrid'),
  staysTabs: document.getElementById('staysTabs'),
  staysGrid: document.getElementById('staysGrid'),
  watersportsGrid: document.getElementById('watersportsGrid'),
  marketsGrid: document.getElementById('marketsGrid'),
  sightseeingTabs: document.getElementById('sightseeingTabs'),
  sightseeingGrid: document.getElementById('sightseeingGrid'),
  tipsGrid: document.getElementById('tipsGrid'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  toast: document.getElementById('toast')
};

// ================= Theme Management =================
function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  state.theme = themeName;
  localStorage.setItem('goa_theme', themeName);

  if (themeName === 'dark') {
    elements.themeToggleBtn.textContent = '🌙';
  } else if (themeName === 'sunset') {
    elements.themeToggleBtn.textContent = '🌅';
  } else {
    elements.themeToggleBtn.textContent = '☀️';
  }
}

function cycleTheme() {
  const themes = ['dark', 'sunset', 'light'];
  const currentIndex = themes.indexOf(state.theme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];
  applyTheme(nextTheme);
  showToast(`Theme switched to ${nextTheme.toUpperCase()}`);
}

// ================= Toast Notifications =================
function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2500);
}

// ================= Filtering & Sorting Logic =================
function getFilteredSpots() {
  let list = GOA_SPOTS.filter(spot => {
    // Region Filter
    if (state.selectedRegion !== 'all' && spot.region !== state.selectedRegion) {
      return false;
    }

    // Category Filter
    if (state.selectedCategory !== 'all') {
      const matchCategory = spot.category === state.selectedCategory || 
                            (spot.categories && spot.categories.includes(state.selectedCategory));
      if (!matchCategory) return false;
    }

    // Keyword Search Filter
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase();
      const matchName = spot.name.toLowerCase().includes(q);
      const matchArea = spot.area.toLowerCase().includes(q);
      const matchTagline = spot.tagline.toLowerCase().includes(q);
      const matchDesc = spot.description.toLowerCase().includes(q);
      const matchVibes = spot.vibes && spot.vibes.some(v => v.toLowerCase().includes(q));
      if (!matchName && !matchArea && !matchTagline && !matchDesc && !matchVibes) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  if (state.sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (state.sortBy === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
}

// ================= Rendering Spot Cards =================
function renderSpots() {
  const filtered = getFilteredSpots();
  elements.visibleSpotsCount.textContent = filtered.length;

  if (filtered.length === 0) {
    elements.spotsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: 18px; border: 1px dashed var(--border-color);">
        <div style="font-size: 48px; margin-bottom: 12px;">🏝️</div>
        <h3 style="font-size: 20px; margin-bottom: 6px;">No Goa spots match your search</h3>
        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 18px;">Try clearing filters or search by another keyword like "Vagator", "Palolem", or "Waterfall".</p>
        <button id="btnResetFilters" style="background: #0284c7; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 700; cursor: pointer;">
          Reset All Filters
        </button>
      </div>
    `;

    document.getElementById('btnResetFilters')?.addEventListener('click', () => {
      state.selectedRegion = 'all';
      state.selectedCategory = 'all';
      state.searchQuery = '';
      elements.searchInput.value = '';
      updatePillUI();
      renderSpots();
    });
    return;
  }

  elements.spotsGrid.innerHTML = filtered.map(spot => {
    const isSaved = state.savedSpotIds.includes(spot.id);
    const regionBadgeClass = spot.region === 'north' ? 'north' : 'south';
    const regionText = spot.region === 'north' ? '⚡ North Goa' : '🌊 South Goa';

    return `
      <article class="spot-card" data-id="${spot.id}">
        <div class="card-media-wrap">
          <img 
            src="${spot.image}" 
            alt="${spot.name}" 
            class="card-img" 
            loading="lazy" 
            onerror="this.src='https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'"
          >
          <div class="card-badges-row">
            <div style="display: flex; gap: 6px; align-items: center;">
              <span class="region-tag ${regionBadgeClass}">${regionText}</span>
              ${spot.category === 'clubs' ? '<span class="club-badge">🪩 Club & Pub</span>' : ''}
            </div>
            <button 
              class="bookmark-btn ${isSaved ? 'saved' : ''}" 
              data-bookmark-id="${spot.id}" 
              title="${isSaved ? 'Remove from My Trip' : 'Save to My Goa Trip'}"
            >
              ${isSaved ? '❤️' : '🤍'}
            </button>
          </div>
          <div class="card-media-bottom">
            <span class="rating-badge">★ ${spot.rating} (${spot.reviewsCount})</span>
          </div>
        </div>

        <div class="card-content">
          <h3 class="spot-name">${spot.name}</h3>
          <div class="spot-tagline">${spot.tagline}</div>
          <p class="spot-desc">${spot.description}</p>

          <div class="reel-tip-box">
            <span>📸</span>
            <div><strong>Reel Angle:</strong> ${spot.reelTip}</div>
          </div>

          <div class="spot-meta-row">
            <div class="meta-item">
              <span>📍</span> <strong>${spot.area}</strong>
            </div>
            <div class="meta-item">
              <span>🕒</span> Best Time: ${spot.bestTime}
            </div>
            <div class="meta-item meta-fee">
              <span>🎟️</span> <div><strong>Entry:</strong> ${spot.entryFee}</div>
            </div>
          </div>

          <div class="card-actions">
            <a 
              href="${spot.mapsUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-maps" 
              title="Open direct Google Maps navigation"
            >
              <span>🧭 Directions</span>
            </a>
            <button class="btn-details" data-modal-id="${spot.id}">
              Quick View
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  attachCardEvents();
}

// ================= Card Interactions & Bookmark Handling =================
function attachCardEvents() {
  // Bookmark Toggle
  document.querySelectorAll('[data-bookmark-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const spotId = btn.getAttribute('data-bookmark-id');
      toggleSaveSpot(spotId);
    });
  });

  // Modal Open
  document.querySelectorAll('[data-modal-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const spotId = btn.getAttribute('data-modal-id');
      openSpotModal(spotId);
    });
  });
}

function toggleSaveSpot(spotId) {
  const spot = GOA_SPOTS.find(s => s.id === spotId);
  if (!spot) return;

  const idx = state.savedSpotIds.indexOf(spotId);
  if (idx > -1) {
    state.savedSpotIds.splice(idx, 1);
    showToast(`Removed "${spot.name}" from your Goa Trip`);
  } else {
    state.savedSpotIds.push(spotId);
    showToast(`Added "${spot.name}" to your Goa Trip! 🎒`);
  }

  localStorage.setItem('goa_saved_spots', JSON.stringify(state.savedSpotIds));
  updateTripCounter();
  renderSpots();
  renderSavedDrawer();
}

function updateTripCounter() {
  const count = state.savedSpotIds.length;
  elements.tripCountBadge.textContent = count;
}

// ================= Saved Trip Drawer =================
function renderSavedDrawer() {
  const savedSpots = GOA_SPOTS.filter(s => state.savedSpotIds.includes(s.id));

  if (savedSpots.length === 0) {
    elements.drawerBody.innerHTML = `
      <div class="empty-saved-state">
        <div class="empty-icon">🎒</div>
        <h4 style="font-size: 18px; margin-bottom: 8px;">Your Trip Plan is Empty</h4>
        <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.5;">
          Click the heart icon on any spot card to build your personalized North & South Goa itinerary.
        </p>
      </div>
    `;
    elements.btnOpenAllInMaps.style.display = 'none';
    elements.btnClearTrip.style.display = 'none';
    return;
  }

  elements.btnOpenAllInMaps.style.display = 'flex';
  elements.btnClearTrip.style.display = 'block';

  elements.drawerBody.innerHTML = `
    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
      Saved <strong>${savedSpots.length} spots</strong> for your trip:
    </div>
    <div class="saved-spots-list">
      ${savedSpots.map((spot, idx) => `
        <div class="saved-spot-item">
          <img src="${spot.image}" alt="${spot.name}" class="saved-spot-thumb">
          <div class="saved-spot-info">
            <div style="font-size: 11px; font-weight: 800; color: #38bdf8;">STOP ${idx + 1} • ${spot.region === 'north' ? 'NORTH' : 'SOUTH'}</div>
            <div class="saved-spot-name">${spot.name}</div>
            <div class="saved-spot-loc">📍 ${spot.area}</div>
          </div>
          <button class="btn-remove-saved" data-remove-id="${spot.id}" title="Remove from list">
            ✕
          </button>
        </div>
      `).join('')}
    </div>
  `;

  // Attach remove buttons
  elements.drawerBody.querySelectorAll('[data-remove-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-remove-id');
      toggleSaveSpot(id);
    });
  });
}

function openMultiStopRoute() {
  const savedSpots = GOA_SPOTS.filter(s => state.savedSpotIds.includes(s.id));
  if (savedSpots.length === 0) {
    showToast('Add at least one spot first!');
    return;
  }

  // Construct multi-stop Google Maps Direction URL
  // Format: https://www.google.com/maps/dir/lat1,lng1/lat2,lng2/...
  const coordinatesList = savedSpots.map(s => `${s.lat},${s.lng}`).join('/');
  const routeUrl = `https://www.google.com/maps/dir/${coordinatesList}`;
  window.open(routeUrl, '_blank', 'noopener,noreferrer');
}

// ================= Spot Details Modal =================
function openSpotModal(spotId) {
  const spot = GOA_SPOTS.find(s => s.id === spotId);
  if (!spot) return;

  const isSaved = state.savedSpotIds.includes(spot.id);

  elements.spotModal.innerHTML = `
    <div class="modal-hero">
      <img src="${spot.image}" alt="${spot.name}" class="modal-img">
      <button class="modal-close-btn" id="btnCloseModal">✕</button>
    </div>

    <div class="modal-body">
      <div style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center; flex-wrap: wrap;">
        <span class="region-tag ${spot.region === 'north' ? 'north' : 'south'}">
          ${spot.region === 'north' ? '⚡ North Goa' : '🌊 South Goa'}
        </span>
        ${spot.category === 'clubs' ? '<span class="club-badge">🪩 Club & Pub</span>' : ''}
        <span class="rating-badge">★ ${spot.rating} (${spot.reviewsCount})</span>
      </div>

      <h2 class="modal-title">${spot.name}</h2>
      <div class="modal-tagline">${spot.tagline}</div>
      <p style="color: var(--text-muted); font-size: 14.5px; line-height: 1.6; margin-bottom: 20px;">
        ${spot.description}
      </p>

      <div class="reel-tip-box" style="margin-bottom: 20px;">
        <span style="font-size: 18px;">📸</span>
        <div>
          <strong style="display: block; margin-bottom: 2px;">Viral Reel & Photography Advice:</strong>
          ${spot.reelTip}
        </div>
      </div>

      <div class="modal-grid">
        <div class="modal-info-card">
          <div class="modal-info-label">📍 Exact Location</div>
          <div class="modal-info-val">${spot.area}</div>
        </div>
        <div class="modal-info-card">
          <div class="modal-info-label">🕒 Best Time & Lighting</div>
          <div class="modal-info-val">${spot.bestTime}</div>
        </div>
        <div class="modal-info-card modal-fee-card">
          <div class="modal-info-label">🎟️ Entry Fee & Cover</div>
          <div class="modal-info-val">${spot.entryFee}</div>
        </div>
        <div class="modal-info-card">
          <div class="modal-info-label">⏰ Visiting Hours</div>
          <div class="modal-info-val">${spot.timings}</div>
        </div>
      </div>

      <div style="background: rgba(14, 165, 233, 0.08); border-left: 3px solid #0ea5e9; padding: 12px 14px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
        <strong style="color: #38bdf8; font-size: 13.5px; display: block; margin-bottom: 3px;">💡 Insider Travel Hack:</strong>
        <span style="color: var(--text-muted); font-size: 13px;">${spot.insiderHack}</span>
      </div>

      <div class="modal-actions">
        <a 
          href="${spot.mapsUrl}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-maps" 
          style="flex: 1;"
        >
          🧭 Open in Google Maps
        </a>
        <button class="btn-trip" id="btnModalSave" style="background: ${isSaved ? '#f97316' : ''};">
          ${isSaved ? '❤️ Saved in Trip' : '➕ Add to My Trip'}
        </button>
      </div>
    </div>
  `;

  elements.spotModalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Attach modal internal events
  document.getElementById('btnCloseModal').addEventListener('click', closeSpotModal);
  document.getElementById('btnModalSave').addEventListener('click', () => {
    toggleSaveSpot(spot.id);
    openSpotModal(spot.id); // re-render modal button state
  });
}

function closeSpotModal() {
  elements.spotModalBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

// ================= Curated Itineraries Section =================
function renderItineraries() {
  // Render tabs
  elements.itinTabs.innerHTML = GOA_ITINERARIES.map(itin => `
    <button 
      class="itin-tab-btn ${itin.id === state.currentItineraryId ? 'active' : ''}" 
      data-itin-id="${itin.id}"
    >
      ${itin.title}
    </button>
  `).join('');

  // Attach tab clicks
  elements.itinTabs.querySelectorAll('[data-itin-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentItineraryId = btn.getAttribute('data-itin-id');
      renderItineraries();
    });
  });

  // Render current itinerary content
  const activeItin = GOA_ITINERARIES.find(i => i.id === state.currentItineraryId) || GOA_ITINERARIES[0];

  elements.itinDisplay.innerHTML = `
    <div class="itin-header">
      <h3 class="itin-title">${activeItin.title}</h3>
      <div class="itin-subtitle">${activeItin.subtitle}</div>
      <div class="itin-badges">
        <span class="itin-badge">⏱️ ${activeItin.duration}</span>
        <span class="itin-badge">📍 ${activeItin.region}</span>
        <span class="itin-badge">🎯 Best for: ${activeItin.bestFor}</span>
      </div>
    </div>

    <div class="days-accordion">
      ${activeItin.days.map(d => `
        <div class="day-box">
          <div class="day-header">${d.day}</div>
          <div class="timeline">
            ${d.schedule.map(item => `
              <div class="timeline-item">
                <span class="timeline-time">${item.time}</span>
                <div class="timeline-content">
                  <strong>${item.spot}</strong>
                  <span>${item.note}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ================= Travel Tips Section =================
function renderTips() {
  elements.tipsGrid.innerHTML = GOA_TRAVEL_TIPS.map(tip => `
    <div class="tip-card">
      <div class="tip-icon">${tip.icon}</div>
      <h3 class="tip-title">${tip.title}</h3>
      <p class="tip-detail">${tip.detail}</p>
    </div>
  `).join('');
}

// ================= Best Places to Eat & Cafes =================
function renderCafes() {
  if (!elements.cafesFilterPills || !elements.cafesGrid) return;

  const areas = ['all', ...GOA_CAFES_DIRECTORY.map(c => c.area)];

  // Render area filter pills
  elements.cafesFilterPills.innerHTML = areas.map(area => {
    const isAll = area === 'all';
    const label = isAll ? '🌟 All Areas' : area;
    const isActive = state.selectedCafeArea === area;
    return `
      <button class="directory-pill ${isActive ? 'active' : ''}" data-cafe-area="${area}">
        ${label}
      </button>
    `;
  }).join('');

  elements.cafesFilterPills.querySelectorAll('[data-cafe-area]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedCafeArea = btn.getAttribute('data-cafe-area');
      renderCafes();
    });
  });

  // Filter places
  let filteredPlaces = [];
  if (state.selectedCafeArea === 'all') {
    GOA_CAFES_DIRECTORY.forEach(c => {
      c.places.forEach(p => {
        filteredPlaces.push({ ...p, area: c.area, icon: c.icon });
      });
    });
  } else {
    const found = GOA_CAFES_DIRECTORY.find(c => c.area === state.selectedCafeArea);
    if (found) {
      filteredPlaces = found.places.map(p => ({ ...p, area: found.area, icon: found.icon }));
    }
  }

  elements.cafesGrid.innerHTML = filteredPlaces.map(cafe => `
    <article class="directory-card cafe-card">
      <div class="dir-card-header">
        <span class="dir-area-badge">${cafe.icon} ${cafe.area}</span>
        <a 
          href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.query || cafe.name + ' Goa')}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-maps-sm"
          title="Open in Google Maps"
        >
          🧭 Maps
        </a>
      </div>
      <h3 class="dir-card-title">${cafe.name}</h3>
      <p class="dir-card-desc">${cafe.highlight}</p>
    </article>
  `).join('');
}

// ================= Nightlife, Casinos & Hidden Parties =================
function renderNightlifeAndCasinos() {
  if (!elements.casinosGrid || !elements.partiesGrid) return;

  // Render Casinos
  elements.casinosGrid.innerHTML = GOA_NIGHTLIFE_AND_CASINOS.casinos.map(casino => `
    <article class="directory-card casino-card">
      <div class="dir-card-header">
        <span class="casino-badge">🎰 Offshore Ship</span>
        <a 
          href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(casino.query || casino.name + ' Goa')}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-maps-sm"
        >
          🧭 Directions
        </a>
      </div>
      <h3 class="dir-card-title">${casino.name}</h3>
      <div class="dir-location">📍 ${casino.location}</div>
      <p class="dir-card-desc">${casino.highlight}</p>
      <div class="casino-entry-box">
        <strong>🎟️ Entry & Chips:</strong> ${casino.entry}
      </div>
    </article>
  `).join('');

  // Render Best Parties & Hidden Venues combined
  const partiesCombined = [
    ...GOA_NIGHTLIFE_AND_CASINOS.partyPlaces.map(p => ({ ...p, tag: '🔥 Best Party Place' })),
    ...GOA_NIGHTLIFE_AND_CASINOS.hiddenParties.map(p => ({ ...p, tag: '✨ Hidden Party Gem' }))
  ];

  elements.partiesGrid.innerHTML = partiesCombined.map(party => `
    <article class="directory-card party-card">
      <div class="dir-card-header">
        <span class="party-tag">${party.tag}</span>
        <a 
          href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(party.name + ' ' + party.area + ' Goa')}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-maps-sm"
        >
          🧭 Maps
        </a>
      </div>
      <h3 class="dir-card-title">${party.name}</h3>
      <div class="dir-location">📍 ${party.area}</div>
      <p class="dir-card-desc">${party.vibe}</p>
    </article>
  `).join('');
}

// ================= Where to Stay (Hotels & Hostels) =================
function renderStays() {
  if (!elements.staysTabs || !elements.staysGrid) return;

  elements.staysTabs.innerHTML = `
    <button class="itin-tab-btn ${state.activeStayType === 'hotels' ? 'active' : ''}" data-stay-tab="hotels">
      🏨 Top Hotels & Resorts
    </button>
    <button class="itin-tab-btn ${state.activeStayType === 'hostels' ? 'active' : ''}" data-stay-tab="hostels">
      🎒 Backpacker Hostels & Co-Living
    </button>
  `;

  elements.staysTabs.querySelectorAll('[data-stay-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeStayType = btn.getAttribute('data-stay-tab');
      renderStays();
    });
  });

  const staysList = GOA_STAYS_DIRECTORY[state.activeStayType] || GOA_STAYS_DIRECTORY.hotels;

  elements.staysGrid.innerHTML = staysList.map(stay => `
    <article class="directory-card stay-card">
      <div class="dir-card-header">
        <span class="dir-region-badge">${stay.region}</span>
        <span class="rating-badge">★ ${stay.rating}</span>
      </div>
      <h3 class="dir-card-title">${stay.name}</h3>
      <div class="stay-type-label">🏡 ${stay.type}</div>
      <p class="dir-card-desc">${stay.highlight}</p>
      <div style="margin-top: auto; padding-top: 12px;">
        <a 
          href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.query || stay.name + ' ' + stay.region)}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-details"
          style="display: flex; align-items: center; justify-content: center; gap: 6px; text-decoration: none;"
        >
          🔍 View Location on Maps
        </a>
      </div>
    </article>
  `).join('');
}

// ================= Water Sports & Markets =================
function renderActivitiesAndMarkets() {
  if (!elements.watersportsGrid || !elements.marketsGrid) return;

  elements.watersportsGrid.innerHTML = GOA_ACTIVITIES_AND_MARKETS.waterSports.map(w => `
    <article class="directory-card activity-card">
      <div class="dir-card-header">
        <span class="region-tag north">${w.region}</span>
        <a 
          href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(w.beach + ' Water Sports Goa')}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-maps-sm"
        >
          🧭 Maps
        </a>
      </div>
      <h3 class="dir-card-title">🏄 ${w.beach}</h3>
      <div class="activity-sports-list">
        <strong>Available Sports:</strong> ${w.sports}
      </div>
      <p class="dir-card-desc">${w.highlight}</p>
    </article>
  `).join('');

  elements.marketsGrid.innerHTML = GOA_ACTIVITIES_AND_MARKETS.fleaMarkets.map(m => `
    <article class="directory-card market-card">
      <div class="dir-card-header">
        <span class="market-badge">🛍️ Flea Market</span>
        <a 
          href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.name + ' ' + m.location)}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-maps-sm"
        >
          🧭 Maps
        </a>
      </div>
      <h3 class="dir-card-title">${m.name}</h3>
      <div class="dir-location">📍 ${m.location}</div>
      <div class="market-time-badge">⏰ ${m.timing}</div>
      <p class="dir-card-desc">${m.highlight}</p>
    </article>
  `).join('');
}

// ================= Sightseeing Beyond Beaches =================
function renderSightseeing() {
  if (!elements.sightseeingTabs || !elements.sightseeingGrid) return;

  const tabs = [
    { id: 'churches', label: '⛪ Historic Churches' },
    { id: 'forts', label: '🏰 Ancient Forts' },
    { id: 'offbeat', label: '🎨 Offbeat & Museums' }
  ];

  elements.sightseeingTabs.innerHTML = tabs.map(t => `
    <button class="itin-tab-btn ${state.activeSightseeingTab === t.id ? 'active' : ''}" data-sightseeing-tab="${t.id}">
      ${t.label}
    </button>
  `).join('');

  elements.sightseeingTabs.querySelectorAll('[data-sightseeing-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeSightseeingTab = btn.getAttribute('data-sightseeing-tab');
      renderSightseeing();
    });
  });

  const list = GOA_SIGHTSEEING_DIRECTORY[state.activeSightseeingTab] || GOA_SIGHTSEEING_DIRECTORY.churches;

  elements.sightseeingGrid.innerHTML = list.map(item => `
    <article class="directory-card sight-card">
      <div class="dir-card-header">
        <span class="dir-area-badge">📍 ${item.area}</span>
        <a 
          href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' Goa')}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-maps-sm"
        >
          🧭 Directions
        </a>
      </div>
      <h3 class="dir-card-title">${item.name}</h3>
      <p class="dir-card-desc">${item.highlight}</p>
    </article>
  `).join('');
}

// ================= UI Filter Helpers =================
function updatePillUI() {
  elements.categoryPills.forEach(pill => {
    const cat = pill.getAttribute('data-cat');
    if (cat === state.selectedCategory) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  elements.regionBtns.forEach(btn => {
    const reg = btn.getAttribute('data-region');
    btn.classList.remove('active', 'north-active', 'south-active');
    if (reg === state.selectedRegion) {
      btn.classList.add('active');
      if (reg === 'north') btn.classList.add('north-active');
      if (reg === 'south') btn.classList.add('south-active');
    }
  });
}

// ================= Event Listeners Initialization =================
function initEventListeners() {
  // Search Input (Real-time debounced)
  let searchTimer;
  elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = e.target.value;
      renderSpots();
    }, 180);
  });

  // Region Toggle Buttons
  elements.regionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedRegion = btn.getAttribute('data-region');
      updatePillUI();
      renderSpots();
    });
  });

  // Category Pill Buttons
  elements.categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      state.selectedCategory = pill.getAttribute('data-cat');
      updatePillUI();
      renderSpots();
    });
  });

  // Sort Dropdown
  elements.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderSpots();
  });

  // Drawer Toggle
  elements.btnOpenTrip.addEventListener('click', () => {
    renderSavedDrawer();
    elements.tripDrawer.classList.add('active');
    elements.drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  const closeDrawer = () => {
    elements.tripDrawer.classList.remove('active');
    elements.drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  elements.btnCloseDrawer.addEventListener('click', closeDrawer);
  elements.drawerBackdrop.addEventListener('click', closeDrawer);

  // Clear Trip
  elements.btnClearTrip.addEventListener('click', () => {
    if (confirm('Clear all saved spots from your trip planner?')) {
      state.savedSpotIds = [];
      localStorage.removeItem('goa_saved_spots');
      updateTripCounter();
      renderSpots();
      renderSavedDrawer();
      showToast('Trip itinerary cleared');
    }
  });

  // Open Route in Google Maps
  elements.btnOpenAllInMaps.addEventListener('click', openMultiStopRoute);

  // Modal Backdrop Click
  elements.spotModalBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.spotModalBackdrop) {
      closeSpotModal();
    }
  });

  // Keyboard Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSpotModal();
      closeDrawer();
    }
  });

  // Theme Toggle Button
  elements.themeToggleBtn.addEventListener('click', cycleTheme);

  // Return to Top (Coconut Buttons)
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const footerScrollBtn = document.getElementById('footerScrollTop');
  const floatingScrollBtn = document.getElementById('floatingScrollTop');

  if (footerScrollBtn) {
    footerScrollBtn.addEventListener('click', scrollToTop);
  }

  if (floatingScrollBtn) {
    floatingScrollBtn.addEventListener('click', scrollToTop);

    // Show floating button when scrolled down
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        floatingScrollBtn.classList.add('show');
      } else {
        floatingScrollBtn.classList.remove('show');
      }
    }, { passive: true });
  }
}

// ================= Application Initialization =================
function initApp() {
  applyTheme(state.theme);
  elements.totalSpotsCount.textContent = `${GOA_SPOTS.length}+`;
  updateTripCounter();
  renderSpots();
  renderItineraries();
  renderCafes();
  renderNightlifeAndCasinos();
  renderStays();
  renderActivitiesAndMarkets();
  renderSightseeing();
  renderTips();
  initEventListeners();
}

// Run on DOM Ready
document.addEventListener('DOMContentLoaded', initApp);
