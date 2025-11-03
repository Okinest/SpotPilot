import { CookieManager } from './cookieManager';

export class TokenManager {
    private static readonly TOKEN_KEY = 'spotify_access_token';

    static saveToken(token: string, expiresInSeconds?: number): void {
        const days = 7;
        const expiryTime = expiresInSeconds
            ? Date.now() + (expiresInSeconds * 1000)
            : Date.now() + (days * 24 * 60 * 60 * 1000);

        const cookieValue = JSON.stringify({ token, expiry: expiryTime });
        CookieManager.setCookie(this.TOKEN_KEY, cookieValue, days);
    }

    static getValidToken(): string | null {
        const cookieValue = CookieManager.getCookie(this.TOKEN_KEY);
        if (!cookieValue) return null;

        try {
            const { token, expiry } = JSON.parse(cookieValue);

            if (Date.now() >= expiry) {
                this.clearToken();
                return null;
            }

            return token;
        } catch {
            return null;
        }
    }

    static clearToken(): void {
        CookieManager.deleteCookie(this.TOKEN_KEY);
    }

    static async validateToken(token: string): Promise<boolean> {
        try {
            const response = await fetch("https://api.spotify.com/v1/me", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}