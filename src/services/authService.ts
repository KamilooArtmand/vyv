import { User } from '../types';

const STORAGE_KEY_AUTH = 'vyv_player_auth_user_en';

export class AuthService {
  private static currentUser: User | null = null;
  private static listeners: ((user: User | null) => void)[] = [];

  static init(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch {
      this.currentUser = null;
    }
  }

  static getCurrentUser(): User | null {
    if (!this.currentUser && typeof window !== 'undefined') {
      this.init();
    }
    return this.currentUser;
  }

  static subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify(): void {
    try {
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch {
      // ignore
    }
    this.listeners.forEach((l) => l(this.currentUser));
  }

  static async loginWithEmail(email: string, pass: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 500));
    if (!email || !pass) return false;

    const username = email.split('@')[0];
    this.currentUser = {
      id: `user-${Date.now()}`,
      username: username.charAt(0).toUpperCase() + username.slice(1),
      handle: `@${username.toLowerCase()}`,
      email,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff`,
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      bio: 'Audiophile, night playlist curator, and soundscape explorer.',
      followersCount: 142,
      followingCount: 89,
    };
    this.notify();
    return true;
  }

  static async registerWithEmail(username: string, email: string, pass: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 500));
    if (!username || !email || !pass) return false;

    this.currentUser = {
      id: `user-${Date.now()}`,
      username,
      handle: `@${username.toLowerCase().replace(/\s+/g, '')}`,
      email,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=ec4899&color=fff`,
      coverUrl: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=1200&q=80',
      bio: 'New listener enjoying crystal soundscapes on VYV.',
      followersCount: 1,
      followingCount: 10,
    };
    this.notify();
    return true;
  }

  static async loginWithOAuth(provider: 'Google' | 'Facebook'): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 600));

    const isGoogle = provider === 'Google';
    this.currentUser = {
      id: `oauth-${Date.now()}`,
      username: isGoogle ? 'Google User' : 'Facebook User',
      handle: isGoogle ? '@google_listener' : '@fb_listener',
      email: isGoogle ? 'user@gmail.com' : 'user@facebook.com',
      avatarUrl: isGoogle
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80',
      bio: `Connected with ${provider} account.`,
      followersCount: 380,
      followingCount: 215,
    };
    this.notify();
    return true;
  }

  static updateUserProfile(
    username: string,
    handle: string,
    bio: string,
    avatarUrl: string,
    coverUrl: string
  ): void {
    if (!this.currentUser) return;
    this.currentUser = {
      ...this.currentUser,
      username,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      bio,
      avatarUrl: avatarUrl || this.currentUser.avatarUrl,
      coverUrl: coverUrl || this.currentUser.coverUrl,
    };
    this.notify();
  }

  static toggleFollow(): void {
    if (!this.currentUser) return;
    this.currentUser = {
      ...this.currentUser,
      followersCount: this.currentUser.followersCount + 1,
    };
    this.notify();
  }

  static logout(): void {
    this.currentUser = null;
    this.notify();
  }
}
