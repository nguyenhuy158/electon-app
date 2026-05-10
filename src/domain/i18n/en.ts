export const MESSAGES = {
  APP: {
    NAME: 'QuickClip',
  },
  TRAY: {
    TOOLTIP: 'QuickClip',
    SHOW_APP: 'Show App',
    CLEAR_HISTORY: 'Clear History',
    QUIT: 'Quit',
    HISTORY_EMPTY: 'No history',
  },
  NOTIFICATIONS: {
    COPIED_TITLE: 'Copied',
    COPIED_BODY: 'Item copied to clipboard',
  },
  AUTH: {
    LOGIN_TITLE: 'Login to QuickClip',
    REGISTER_TITLE: 'Register for QuickClip',
    ALREADY_HAVE_ACCOUNT: 'Already have an account? Login',
    NEED_ACCOUNT: "Don't have an account? Register",
    INVALID_CREDENTIALS: 'Invalid credentials',
    REGISTRATION_FAILED: 'Registration failed',
    LOGIN_FAILED: 'Login failed',
    CLIENT_NOT_INIT: 'Neon Auth client not initialized. Please check NEON_AUTH_URL in .env',
    URL_NOT_CONFIG: 'Neon Auth URL not configured in .env',
    USER_NOT_FOUND: 'User not found in database',
  },
  ERRORS: {
    DB_INIT_FAILED: 'Failed to init DB:',
    SYNC_FAILED: 'Sync failed:',
  },
} as const;
