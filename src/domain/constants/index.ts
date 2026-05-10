export const APP_CONSTANTS = {
  UI: {
    WINDOW_WIDTH: 400,
    WINDOW_HEIGHT: 600,
    TRAY_ICON_PATH: '../icon.png',
  },
  CLIPBOARD: {
    POLLING_INTERVAL_MS: 1000,
    DEFAULT_HISTORY_LIMIT: 10,
  },
  DATABASE: {
    DEFAULT_LIMIT: 10,
  },
  AUTH: {
    DEFAULT_SALT_ROUNDS: 10,
  },
} as const;
