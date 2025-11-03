import { redirectToAuthCodeFlow, getAccessToken } from "./authCodeWithPkce";
import { TokenManager } from "./tokenManager";

const clientId = "YOUR_CLIENT_ID_HERE";

async function initializeApp() {
    let accessToken = TokenManager.getValidToken();

    const loginSection = document.getElementById("loginSection");
    const profileSection = document.getElementById("profile");
    const artistsSection = document.getElementById("artists");
    const searchSection = document.getElementById("search");

    function showOnlyLogin() {
        if (loginSection) loginSection.style.display = "block";
        if (profileSection) profileSection.style.display = "none";
        if (artistsSection) artistsSection.style.display = "none";
        if (searchSection) searchSection.style.display = "none";
    }

    function showAppSections() {
        if (loginSection) loginSection.style.display = "none";
        if (profileSection) profileSection.style.display = "block";
        if (artistsSection) artistsSection.style.display = "block";
        if (searchSection) searchSection.style.display = "block";
    }

    if(accessToken) {
        const isValid = await TokenManager.validateToken(accessToken);
        if(isValid) {
            showAppSections();
            await loadProfile(accessToken);
            await loadFollowedArtists(accessToken);
            setupSearchSection(accessToken);
            return;
        } else {
            TokenManager.clearToken();
            accessToken = null;
        }
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
        try {
            accessToken = await getAccessToken(clientId, code);
            showAppSections();
            await loadProfile(accessToken);
            await loadFollowedArtists(accessToken);
            setupSearchSection(accessToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            showOnlyLogin();
            showLoginButton();
        }
    } else {
        showOnlyLogin();
        showLoginButton();
    }
}

function setupSearchSection(token: string) {
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    const searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;
    const searchTypeSelect = document.getElementById("searchType") as HTMLSelectElement;

    const performSearch = async () => {
        const query = searchInput.value.trim();
        const searchType = searchTypeSelect.value;
        if (!query) return;

        searchBtn.disabled = true;
        searchBtn.textContent = "Searching...";

        try {
            const results = await searchContent(token, query, searchType);
            if (searchType === 'track') {
                populateSearchResults(results.tracks?.items || []);
            } else {
                populateArtistSearchResults(results.artists?.items || [], token);
            }
        } catch (error) {
            const resultsContainer = document.getElementById("searchResults");
            if (resultsContainer) resultsContainer.innerHTML = '<p class="text-red-500">Erreur lors de la recherche</p>';
        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = "Search";
        }
    };

    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            performSearch();
        }
    });
}

async function searchContent(token: string, query: string, type: string): Promise<SearchResponse> {
    const encodedQuery = encodeURIComponent(query);
    const result = await fetch(`https://api.spotify.com/v1/search?q=${encodedQuery}&type=${type}&limit=5`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!result.ok) {
        throw new Error(`Erreur HTTP: ${result.status}`);
    }

    return await result.json();
}

async function followArtist(token: string, artistId: string): Promise<boolean> {
    const result = await fetch(`https://api.spotify.com/v1/me/following?type=artist&ids=${artistId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    return result.ok;
}

async function unfollowArtist(token: string, artistId: string): Promise<boolean> {
    const result = await fetch(`https://api.spotify.com/v1/me/following?type=artist&ids=${artistId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    return result.ok;
}

async function checkIfFollowingArtists(token: string, artistIds: string[]): Promise<boolean[]> {
    const ids = artistIds.join(',');
    const result = await fetch(`https://api.spotify.com/v1/me/following/contains?type=artist&ids=${ids}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!result.ok) {
        throw new Error(`Erreur HTTP: ${result.status}`);
    }

    return await result.json();
}

async function loadProfile(token: string) {
    try {
        const profile = await fetchProfile(token);
        populateUI(profile);
        showLogoutButton();
    } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        TokenManager.clearToken();
        showLoginButton();
    }
}

async function fetchProfile(token: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!result.ok) {
        throw new Error(`Erreur HTTP: ${result.status}`);
    }

    return await result.json();
}

async function loadFollowedArtists(token: string) {
    try {
        const followedArtists = await fetchFollowedArtists(token);
        populateArtistsUI(followedArtists.artists.items);
    } catch (error) {
        console.error("Erreur lors du chargement des artistes suivis:", error);
    }
}

async function fetchFollowedArtists(token: string): Promise<FollowedArtistsResponse> {
    const result = await fetch("https://api.spotify.com/v1/me/following?type=artist&limit=25", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!result.ok) {
        throw new Error(`Erreur HTTP: ${result.status}`);
    }

    return await result.json();
}

function populateArtistsUI(artists: Artist[]) {
    const artistsGrid = document.getElementById("artistsGrid");
    if (!artistsGrid) return;
    artistsGrid.innerHTML = "";

    artists.forEach(artist => {
        const artistCard = document.createElement("div");
        artistCard.className = "bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-xl";

        const imageUrl = artist.images[0]?.url || '';
        const followers = artist.followers.total.toLocaleString();
        const genres = artist.genres.slice(0, 2).join(", ");

        artistCard.innerHTML = `
            <div class="text-center">
                ${imageUrl ? `<img src="${imageUrl}" alt="${artist.name}" class="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg">` : ''}
                <h3 class="text-lg font-bold text-white mb-2">${artist.name}</h3>
                <p class="text-gray-400 text-sm mb-2">${followers} followers</p>
                ${genres ? `<p class="text-gray-500 text-xs mb-4">${genres}</p>` : `<p class="text-gray-500 text-xs mb-4">Aucun genre attribué</p>`}
                <a href="${artist.external_urls.spotify}" target="_blank" 
                   class="inline-block bg-spotify-green text-black font-medium py-2 px-4 rounded-full transition-colors text-sm">
                    Open in Spotify
                </a>
            </div>
        `;
        artistsGrid.appendChild(artistCard);
    });
}

function populateUI(profile: UserProfile) {
    document.getElementById("displayName")!.innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar")!.appendChild(profileImage);
    }
    document.getElementById("id")!.innerText = profile.id;
    document.getElementById("email")!.innerText = profile.email;
    document.getElementById("uri")!.innerText = profile.uri;
    document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url")!.innerText = profile.href;
    document.getElementById("url")!.setAttribute("href", profile.href);
}

function populateSearchResults(tracks: Track[]) {
    const resultsContainer = document.getElementById("searchResults");
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    tracks.forEach(track => {
        const trackCard = document.createElement("div");
        trackCard.className = "play-iframe-btn bg-gray-800 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-700 transition-colors";

        const albumImage = track.album.images[0]?.url || '';
        const artistNames = track.artists.map(artist => artist.name).join(", ");
        const duration = formatDuration(track.duration_ms);

        trackCard.innerHTML = `
            <div class="flex items-start gap-4 mb-4">
                <div class="flex-shrink-0">
                    ${ albumImage ? `<img src="${albumImage}" alt="${track.album.name}" class="w-16 h-16 rounded">` :
            `<div class="w-16 h-16 bg-gray-600 rounded flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                </svg>
            </div>`
        }
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-white font-semibold truncate">${track.name}</h3>
                    <p class="text-gray-400 text-sm truncate">${artistNames}</p>
                    <p class="text-gray-500 text-xs">${track.album.name} • ${duration}</p>
                </div>
            </div>
            <div class="iframe-container w-100 hidden">
                <iframe 
                    src="https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0" 
                    width="100%" 
                    height="152" 
                    allowfullscreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                    class="rounded">
                </iframe>
            </div>
        `;

        trackCard.addEventListener('click', () => {
            const iframeContainer = trackCard.querySelector('.iframe-container') as HTMLElement;
            toggleIframeVisibility(iframeContainer);
        });

        resultsContainer.appendChild(trackCard);
    });
}

function populateArtistSearchResults(artists: Artist[], token: string) {
    const resultsContainer = document.getElementById("searchResults");
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    if (artists.length === 0) {
        resultsContainer.innerHTML = '<p class="text-gray-400 text-center">Aucun artiste trouvé</p>';
        return;
    }

    const artistIds = artists.map(artist => artist.id);
    checkIfFollowingArtists(token, artistIds).then(followingStatus => {
        artists.forEach((artist, index) => {
            const artistCard = document.createElement("div");
            artistCard.className = "bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors";

            const imageUrl = artist.images[0]?.url || '';
            const followers = artist.followers.total.toLocaleString();
            const genres = artist.genres.slice(0, 3).join(", ");
            const isFollowing = followingStatus[index];

            artistCard.innerHTML = `
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${artist.name}" class="w-20 h-20 rounded-full">` :
                `<div class="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center">
                                <svg class="w-10 h-10 text-gray-400" viewBox="0 0 20 20">
                                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                                </svg>
                            </div>`
            }
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-white font-bold text-lg truncate">${artist.name}</h3>
                        <p class="text-gray-400 text-sm mb-1">${followers} followers</p>
                        ${genres ? `<p class="text-gray-500 text-xs mb-3">${genres}</p>` : '<div class="mb-3"></div>'}
                        <div class="flex gap-2">
                            <button class="follow-btn ${isFollowing ? 'bg-gray-600 hover:bg-gray-500' : 'bg-spotify-green hover:bg-green-600'} 
                                           text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                    data-artist-id="${artist.id}" data-following="${isFollowing}">
                                ${isFollowing ? 'Ne plus suivre' : 'Suivre'}
                            </button>
                            <a href="${artist.external_urls.spotify}" target="_blank"
                               class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                                Ouvrir dans Spotify
                            </a>
                        </div>
                    </div>
                </div>
            `;

            resultsContainer.appendChild(artistCard);
        });

        document.querySelectorAll('.follow-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.currentTarget as HTMLButtonElement;
                const artistId = button.getAttribute('data-artist-id')!;
                const isFollowing = button.getAttribute('data-following') === 'true';

                button.disabled = true;
                button.textContent = isFollowing ? 'Suppression...' : 'Suivi...';

                try {
                    let success;
                    if (isFollowing) {
                        success = await unfollowArtist(token, artistId);
                    } else {
                        success = await followArtist(token, artistId);
                    }

                    if (success) {
                        const newFollowingState = !isFollowing;
                        button.setAttribute('data-following', newFollowingState.toString());
                        button.textContent = newFollowingState ? 'Ne plus suivre' : 'Suivre';
                        button.className = `follow-btn ${newFollowingState ? 'bg-gray-600 hover:bg-gray-500' : 'bg-spotify-green hover:bg-green-600'} 
                                           text-white px-4 py-2 rounded-full text-sm font-medium transition-colors`;
                    } else {
                        throw new Error('Échec de l\'opération');
                    }
                } catch (error) {
                    console.error('Erreur lors du suivi/désuivi:', error);
                    button.textContent = 'Erreur';
                    setTimeout(() => {
                        button.textContent = isFollowing ? 'Ne plus suivre' : 'Suivre';
                    }, 2000);
                } finally {
                    button.disabled = false;
                }
            });
        });
    });
}

function toggleIframeVisibility(iframeContainer: HTMLElement) {
    const isHidden = iframeContainer.classList.contains('hidden');

    document.querySelectorAll('.iframe-container').forEach(container => {
        if (container !== iframeContainer) {
            container.classList.add('hidden');
        }
    });

    if (isHidden) {
        iframeContainer.classList.remove('hidden');
    } else {
        iframeContainer.classList.add('hidden');
    }
}

function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function showLoginButton() {
    const loginSection = document.getElementById("loginSection");
    if (loginSection) {
        loginSection.innerHTML = `
            <div class="text-center">
                <button id="loginBtn" class="bg-spotify-green hover:cursor-pointer text-black font-bold py-3 px-8 rounded-full transition-colors">
                    Sign in with Spotify
                </button>
            </div>
        `;
        document.getElementById("loginBtn")!.addEventListener("click", () => {
            redirectToAuthCodeFlow(clientId);
        });
    }
}

function showLogoutButton() {
    const profileSection = document.getElementById("profile");

    if (profileSection) {
        const logoutBtn = document.createElement("button");
        logoutBtn.textContent = "Logout";
        logoutBtn.className = "mx-auto block mt-6 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors hover:cursor-pointer";
        logoutBtn.addEventListener("click", () => {
            TokenManager.clearToken();
            location.reload();
        });
        profileSection.appendChild(logoutBtn);
    }
}

initializeApp();
