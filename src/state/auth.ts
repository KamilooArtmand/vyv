import { createStore } from '../lib/store';
import { AuthService } from '../services/authService';
import type { User } from '../types';

AuthService.init();
export const authStore = createStore<{ user: User | null }>({ user: AuthService.getCurrentUser() });
AuthService.subscribe((user) => authStore.set({ user }));
