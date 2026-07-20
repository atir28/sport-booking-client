import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ne';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private platformId = inject(PLATFORM_ID);

  theme = signal<ThemeMode>(this.loadSetting<ThemeMode>('theme', 'system'));
  language = signal<Language>(this.loadSetting<Language>('language', 'en'));

  private resolvedTheme = signal<'light' | 'dark'>('light');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.applyTheme();

      effect(() => {
        const t = this.theme();
        this.saveSetting('theme', t);
        this.applyTheme();
      });

      effect(() => {
        this.saveSetting('language', this.language());
      });
    }
  }

  get currentTheme(): 'light' | 'dark' {
    return this.resolvedTheme();
  }

  setTheme(mode: ThemeMode) {
    this.theme.set(mode);
  }

  setLanguage(lang: Language) {
    this.language.set(lang);
  }

  private applyTheme() {
    const mode = this.theme();
    let resolved: 'light' | 'dark';

    if (mode === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = mode;
    }

    this.resolvedTheme.set(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }

  private loadSetting<T>(key: string, fallback: T): T {
    if (!isPlatformBrowser(this.platformId)) return fallback;
    try {
      const val = localStorage.getItem(`sv_${key}`);
      return val ? (JSON.parse(val) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveSetting(key: string, value: unknown) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(`sv_${key}`, JSON.stringify(value));
    } catch { /* noop */ }
  }
}
