// ── 1. DOM REFERENCES ─────────────────────────────────────
const hamburger        = document.getElementById('hamburger');
const nav              = document.getElementById('nav');
const recipeGrid       = document.getElementById('recipeGrid');
const modalOverlay     = document.getElementById('modalOverlay');
const openFormBtn      = document.getElementById('openFormBtn');
const modalClose       = document.getElementById('modalClose');
const saveRecipeBtn    = document.getElementById('saveRecipeBtn');
const searchInput      = document.getElementById('searchInput');
const categoryFilter   = document.getElementById('categoryFilter');
const shoppingPanel    = document.getElementById('shoppingPanel');
const shoppingItems    = document.getElementById('shoppingItems');
const closeShoppingPanel = document.getElementById('closeShoppingPanel');

// ── 2. INITIAL BASE DATA MODEL ─────────────────────────────
let recipes = [
  {id:1, name:'Jollof Rice', category:'dinner', cuisine:'Nigerian', emoji:'🍚',
   ingredients:['2 cups rice','Tomato paste','Onions','Seasoning','Chicken stock'],
   instructions:'Fry tomato base, add stock, cook rice.', isFavorite:false},
  {id:2, name:'Avocado Toast', category:'breakfast', cuisine:'International', emoji:'🥑',
   ingredients:['2 slices bread','1 ripe avocado','Salt','Pepper','Lemon'],
   instructions:'Toast bread, mash avocado, spread.', isFavorite:false},
  {id:3, name:'Chicken Pasta', category:'dinner', cuisine:'Italian', emoji:'🍝',
   ingredients:['200g pasta','Chicken','Cream','Garlic','Parmesan'],
   instructions:'Cook pasta, fry garlic and chicken, add cream.', isFavorite:true},
  {id:4, name:'Mango Smoothie', category:'snack', cuisine:'Tropical', emoji:'🥭',
   ingredients:['2 mangoes','1 cup milk','Honey','Ice'],
   instructions:'Blend all until smooth.', isFavorite:false},
  {id:5, name:'Chocolate Cake', category:'dessert', cuisine:'American', emoji:'🎂',
   ingredients:['Flour','Cocoa','Sugar','Eggs','Butter','Milk','Baking powder'],
   instructions:'Mix, bake at 180C for 35 min.', isFavorite:false}
];

// ── 3. LOCALSTORAGE PERSISTENCE ────────────────────────────
function saveToStorage() { 
    localStorage.setItem('recipebookData', JSON.stringify(recipes)); 
}

function loadFromStorage() {
    const s = localStorage.getItem('recipebookData');
    if (s !== null) recipes = JSON.parse(s);
}

// ── 4. RENDERING CARDS STRATEGY ───────────────────────────
function renderRecipes(list) {
    if (list.length === 0) {
        recipeGrid.innerHTML = `<div class='empty-state'><div class='icon'>🍽</div><p>No recipes found.</p></div>`;
        return;
    }
    let html = '';
    list.forEach(function(r) {
        const preview = r.ingredients.slice(0,3).map(i=>`<span style='font-size:.8rem;color:#6B7280'>• ${i}</span>`).join('<br>');
        const heart = r.isFavorite ? '❤' : '🤍';
        const fc = r.isFavorite ? 'btn-icon btn-favorite active' : 'btn-icon btn-favorite';
        
        html += `<div class='card'>
            <div class='card-header'>${r.emoji||'🍽'}</div>
            <div class='card-body'>
                <h3 class='card-title'>${r.name}</h3>
                <span class='card-badge'>${r.category}</span>
                <p class='card-cuisine'>Cuisine: ${r.cuisine}</p>
                <div style='margin-top:8px'>${preview}</div>
            </div>
            <div class='card-actions'>
                <button class='btn-icon btn-delete' data-id='${r.id}'>🗑 Delete</button>
                <button class='btn-icon btn-shopping' data-id='${r.id}'>🛒 Shop</button>
                <button class='${fc}' data-id='${r.id}'>${heart} Fav</button>
            </div>
        </div>`;
    });
    recipeGrid.innerHTML = html;
    attachCardEvents();
}

// ── 5. DELEGATED INTERACTIVE CARD EVENTS ──────────────────
function attachCardEvents() {
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!confirm('Delete this recipe?')) return;
            const targetId = Number(this.dataset.id);
            recipes = recipes.filter(r => r.id !== targetId);
            saveToStorage(); 
            renderRecipes(recipes);
        });
    });
    document.querySelectorAll('.btn-favorite').forEach(btn => {
        btn.addEventListener('click', function() { 
            toggleFavorite(Number(this.dataset.id)); 
        });
    });
    document.querySelectorAll('.btn-shopping').forEach(btn => {
        btn.addEventListener('click', function() { 
            openShoppingList(Number(this.dataset.id)); 
        });
    });
}

// ── 6. MOBILE HAMBURGER TOGGLE ───────────────────────────
hamburger.addEventListener('click', () => nav.classList.toggle('open'));

// ── 7. MODAL OVERLAY LOGIC ────────────────────────────────
openFormBtn.addEventListener('click', () => modalOverlay.classList.add('open'));
modalClose.addEventListener('click', () => modalOverlay.classList.remove('open'));
modalOverlay.addEventListener('click', e => { 
    if(e.target === modalOverlay) modalOverlay.classList.remove('open'); 
});

saveRecipeBtn.addEventListener('click', function() {
    const name = document.getElementById('recipeName').value.trim();
    const ingredients = document.getElementById('recipeIngredients').value.split('\n').map(l=>l.trim()).filter(Boolean);
    
    if (!name || !ingredients.length) { 
        alert('Enter a name and at least one ingredient.'); 
        return; 
    }
    
    recipes.push({ 
        id: Date.now(), 
        name,
        category: document.getElementById('recipeCategory').value,
        cuisine: document.getElementById('recipeCuisine').value.trim() || 'Not specified',
        emoji: document.getElementById('recipeEmoji').value.trim() || '🍽',
        ingredients, 
        instructions: document.getElementById('recipeInstructions').value.trim(),
        isFavorite: false 
    });
    
    saveToStorage(); 
    renderRecipes(recipes);
    modalOverlay.classList.remove('open');
    
    ['recipeName','recipeCuisine','recipeIngredients','recipeInstructions','recipeEmoji']
        .forEach(id => document.getElementById(id).value = '');
});

// ── 8. LIVE SEARCH & FILTER SYNC ──────────────────────────
function applyFilters() {
    const s = searchInput.value.toLowerCase().trim();
    const c = categoryFilter.value;
    
    const filtered = recipes.filter(r => 
        (r.name.toLowerCase().includes(s) || r.cuisine.toLowerCase().includes(s))
        && (c === 'all' || r.category === c)
    );
    renderRecipes(filtered);
}
searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);

// ── 9. SHOPPING LIST RENDERING ENGINE ─────────────────────
closeShoppingPanel.addEventListener('click', () => shoppingPanel.classList.remove('open'));

function openShoppingList(id) {
    const r = recipes.find(recipe => recipe.id === id);
    if (!r) return;
    
    shoppingItems.innerHTML = `
        <p style='font-weight:600; color:#40916C; margin-bottom:16px'>${r.emoji} ${r.name}</p>
        ${r.ingredients.map(i => `<div class='shopping-item'>🛒 ${i}</div>`).join('')}
        <p style='margin-top:16px; color:#6B7280; font-size:.85rem'>${r.ingredients.length} items total</p>
    `;
    shoppingPanel.classList.add('open');
}

// ── 10. FAVORITE TOGGLE CONTROLLER ────────────────────────
function toggleFavorite(id) {
    const r = recipes.find(recipe => recipe.id === id);
    if (r) { 
        r.isFavorite = !r.isFavorite; 
        saveToStorage(); 
        renderRecipes(recipes); 
    }
}

// ── 11. BOOTSTRAP INIT SYSTEM ─────────────────────────────
function init() { 
    loadFromStorage(); 
    renderRecipes(recipes); 
}
init();