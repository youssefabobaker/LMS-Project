import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'lumina-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _isDark = new BehaviorSubject<boolean>(false);
  /** Emits `true` when dark mode is active. */
  isDarkMode$ = this._isDark.asObservable();

  get isDark(): boolean {
    return this._isDark.value;
  }

  /**
   * Call once on app start (e.g. in DashboardComponent.ngOnInit).
   * Reads the saved preference from localStorage and applies it.
   */
  initTheme(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark =
      saved !== null
        ? saved === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
    this._applyTheme(prefersDark);
  }

  /** Toggle between light and dark mode. */
  toggleTheme(): void {
    this._applyTheme(!this._isDark.value);
  }

  private _applyTheme(dark: boolean): void {
    if (dark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    this._isDark.next(dark);
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  }
}
