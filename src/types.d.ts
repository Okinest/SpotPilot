interface UserProfile {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
        filter_enabled: boolean,
        filter_locked: boolean
    },
    external_urls: { spotify: string; };
    followers: { href: string; total: number; };
    href: string;
    id: string;
    images: Image[];
    product: string;
    type: string;
    uri: string;
}

interface Image {
    url: string;
    height: number;
    width: number;
}

interface Artist {
    external_urls: { spotify: string };
    followers: { href: string | null; total: number };
    genres: string[];
    href: string;
    id: string;
    images: Image[];
    name: string;
    popularity: number;
    type: string;
    uri: string;
}

interface FollowedArtistsResponse {
    artists: {
        href: string;
        limit: number;
        next: string | null;
        cursors: { after: string | null };
        total: number;
        items: Artist[];
    };
}

interface Track {
    id: string;
    name: string;
    artists: { name: string; id: string }[];
    album: {
        name: string;
        images: Image[];
    };
    duration_ms: number;
    external_urls: { spotify: string };
    preview_url: string | null;
    popularity: number;
}

interface SearchResponse {
    tracks?: {
        href: string;
        items: Track[];
        limit: number;
        next: string | null;
        offset: number;
        previous: string | null;
        total: number;
    };
    artists?: {
        href: string;
        items: Artist[];
        limit: number;
        next: string | null;
        offset: number;
        previous: string | null;
        total: number;
    };
}


