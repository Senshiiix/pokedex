document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pokemon-form');
    const pokemonNameInput = document.getElementById('pokemon-name');
    const pokemonNameDisplay = document.getElementById('pokemon-name-display');
    const pokemonImage = document.getElementById('pokemon-image');
    const pokemonType = document.getElementById('pokemon-type');
    const pokemonInfo = document.getElementById('pokemon-info');
    const pokemonList = document.getElementById('pokemon-list');
    const moreInfoButton = document.getElementById('more-info-button');
    
    // Modal elements
    const modal = document.getElementById('pokemon-modal');
    const modalCloseButton = document.querySelector('.close-button');
    const modalName = document.getElementById('modal-name');
    const modalImage = document.getElementById('modal-image');
    const modalType = document.getElementById('modal-type');
    const modalHeight = document.getElementById('modal-height');
    const modalWeight = document.getElementById('modal-weight');
    const modalAbilities = document.getElementById('modal-abilities');
    
    // Historique des Pokémon
    const recentViewedContainer = document.getElementById('recent-cards');
    let recentViewed = [];

    // Recommandations
    const recommendationContainer = document.getElementById('recommendation-cards');
    let recommendations = [];

    // Fonction pour obtenir les suggestions de Pokémon
    async function fetchPokemonSuggestions(query) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
            const data = await response.json();
            const suggestions = data.results
                .filter(pokemon => pokemon.name.startsWith(query.toLowerCase()))
                .map(pokemon => pokemon.name);

            return suggestions;
        } catch (error) {
            console.error('Erreur lors de la récupération des suggestions:', error);
            return [];
        }
    }

    // Met à jour la liste de suggestions pour l'auto-complétion
    async function updateSuggestions() {
        const query = pokemonNameInput.value;
        if (query.length > 1) {
            const suggestions = await fetchPokemonSuggestions(query);
            pokemonList.innerHTML = suggestions.map(name => `<option value="${name}">`).join('');
        } else {
            pokemonList.innerHTML = '';
        }
    }

    // Écouteur d'événements pour l'input de recherche
    pokemonNameInput.addEventListener('input', updateSuggestions);

    // Fonction pour afficher les détails du Pokémon
    async function fetchPokemonData(name) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
            if (!response.ok) throw new Error('Pokémon non trouvé');
            const data = await response.json();
            displayPokemon(data);
            addToRecentViewed(data);
        } catch (error) {
            pokemonNameDisplay.textContent = error.message;
            pokemonImage.src = '';
            pokemonType.textContent = '';
            pokemonInfo.style.display = 'none'; // Masquer les infos si le Pokémon n'est pas trouvé
        }
    }

    // Fonction pour afficher les données du Pokémon
    function displayPokemon(data) {
        pokemonNameDisplay.textContent = data.name.toUpperCase();
        pokemonImage.src = data.sprites.front_default;
        pokemonType.textContent = 'Type: ' + data.types.map(typeInfo => typeInfo.type.name).join(', ');
        
        // Afficher les informations du Pokémon
        pokemonInfo.style.display = 'block';

        // Mettre à jour les données pour le bouton "Plus d'infos"
        moreInfoButton.dataset.pokemonName = data.name;
        moreInfoButton.dataset.pokemonData = JSON.stringify({
            height: data.height,
            weight: data.weight,
            abilities: data.abilities.map(a => a.ability.name).join(', ')
        });
    }

    // Fonction pour ajouter un Pokémon à l'historique
    function addToRecentViewed(pokemon) {
        if (!recentViewed.find(p => p.name === pokemon.name)) {
            recentViewed.unshift(pokemon);
            if (recentViewed.length > 5) recentViewed.pop(); // Limiter l'historique à 5 Pokémon
            renderRecentViewed();
        }
    }

    // Fonction pour afficher l'historique des Pokémon
    function renderRecentViewed() {
        recentViewedContainer.innerHTML = recentViewed.map(pokemon => `
            <div class="card" data-pokemon-name="${pokemon.name}">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <h3>${pokemon.name.toUpperCase()}</h3>
            </div>
        `).join('');
        
        // Ajouter des écouteurs d'événements pour les cartes d'historique
        document.querySelectorAll('#recent-cards .card').forEach(card => {
            card.addEventListener('click', () => {
                const name = card.dataset.pokemonName;
                pokemonNameInput.value = name;
                fetchPokemonData(name);
            });
        });
    }

    // Fonction pour afficher la modal
    function showModal(pokemonName) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`)
            .then(response => response.json())
            .then(data => {
                modalName.textContent = data.name.toUpperCase();
                modalImage.src = data.sprites.front_default;
                modalType.textContent = 'Type: ' + data.types.map(typeInfo => typeInfo.type.name).join(', ');
                modalHeight.textContent = 'Height: ' + data.height / 10 + ' m';
                modalWeight.textContent = 'Weight: ' + data.weight / 10 + ' kg';
                modalAbilities.textContent = 'Abilities: ' + data.abilities.map(a => a.ability.name).join(', ');
                modal.style.display = 'flex'; // Changer de 'block' à 'flex' pour centrer avec flexbox
            })
            .catch(error => console.error('Erreur lors de la récupération des données du Pokémon:', error));
    }

    // Écouteur d'événements pour le bouton de plus d'infos
    moreInfoButton.addEventListener('click', () => {
        const pokemonName = moreInfoButton.dataset.pokemonName;
        showModal(pokemonName);
    });

    // Écouteur d'événements pour fermer la modal
    modalCloseButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Fonction pour générer des recommandations aléatoires
    async function fetchRecommendations() {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20`);
            const data = await response.json();
            recommendations = data.results
                .sort(() => 0.5 - Math.random()) // Mélange aléatoire
                .slice(0, 5); // Prendre 5 recommandations
            renderRecommendations();
        } catch (error) {
            console.error('Erreur lors de la récupération des recommandations:', error);
        }
    }

    // Fonction pour afficher les recommandations
    function renderRecommendations() {
        recommendationContainer.innerHTML = recommendations.map(pokemon => `
            <div class="card" data-pokemon-name="${pokemon.name}">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.url.split('/')[6]}.png" alt="${pokemon.name}">
                <h3>${pokemon.name.toUpperCase()}</h3>
            </div>
        `).join('');
        
        // Ajouter des écouteurs d'événements pour les cartes de recommandations
        document.querySelectorAll('#recommendation-cards .card').forEach(card => {
            card.addEventListener('click', () => {
                const name = card.dataset.pokemonName;
                pokemonNameInput.value = name;
                fetchPokemonData(name);
            });
        });
    }

    // Écouteur d'événements pour le formulaire de recherche
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const pokemonName = pokemonNameInput.value;
        fetchPokemonData(pokemonName);
    });

    // Initialiser les recommandations à la charge de la page
    fetchRecommendations();
});
