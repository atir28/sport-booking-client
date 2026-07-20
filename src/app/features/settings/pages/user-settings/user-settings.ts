import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SettingsService, ThemeMode, Language } from '../../services/settings.service';

interface ThemeOption {
  value: ThemeMode;
  label: string;
  icon: string;
  description: string;
}

interface LangOption {
  value: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

@Component({
  selector: 'app-user-settings',
  imports: [CommonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './user-settings.html',
  styleUrl: './user-settings.scss',
})
export class UserSettingsComponent {
  private settingsService = inject(SettingsService);
  private messageService = inject(MessageService);

  themeOptions: ThemeOption[] = [
    { value: 'light', label: 'Light', icon: 'pi-sun', description: 'Bright neumorphic look' },
    { value: 'dark', label: 'Dark', icon: 'pi-moon', description: 'Easy on the eyes' },
    { value: 'system', label: 'System', icon: 'pi-desktop', description: 'Match your device' },
  ];

  languageOptions: LangOption[] = [
    { value: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
    { value: 'ne', label: 'Nepali', nativeLabel: 'नेपाली', flag: '🇳🇵' },
  ];

  get currentTheme(): ThemeMode {
    return this.settingsService.theme();
  }

  get currentLanguage(): Language {
    return this.settingsService.language();
  }

  selectTheme(mode: ThemeMode) {
    this.settingsService.setTheme(mode);
    this.messageService.add({
      severity: 'success',
      summary: 'Theme Updated',
      detail: `Switched to ${mode} mode.`,
    });
  }

  selectLanguage(lang: Language) {
    this.settingsService.setLanguage(lang);
    this.messageService.add({
      severity: 'success',
      summary: 'Language Updated',
      detail: `Language set to ${lang === 'en' ? 'English' : 'Nepali'}.`,
    });
  }

  isActive(type: 'theme' | 'lang', value: string): boolean {
    return type === 'theme' ? this.currentTheme === value : this.currentLanguage === value;
  }
}
