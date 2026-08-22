/**
 * Cyanotype Theme Manager
 * Handles light/dark theme toggling, localStorage persistence, and system preference sync.
 */

(function () {
  var STORAGE_KEY = 'cyanotype-theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore write failures (private browsing, quota, etc.) */
    }
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateToggleIcons(theme);
  }

  function updateToggleIcons(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
      // Update inner icon if lucide icons are present
      var icon = btn.querySelector('[data-lucide]');
      if (icon) {
        icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  function toggleTheme() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setStoredTheme(next);
    if (window.GlobeTrotterApp) {
      window.GlobeTrotterApp.showToast('Theme switched to ' + next + ' mode', 'info');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateToggleIcons(currentTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });
  });

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!getStoredTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  window.CyanotypeTheme = {
    getTheme: currentTheme,
    setTheme: applyTheme,
    toggle: toggleTheme
  };
})();
