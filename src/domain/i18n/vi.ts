export const MESSAGES = {
  APP: {
    NAME: 'QuickClip',
  },
  TRAY: {
    TOOLTIP: 'QuickClip',
    SHOW_APP: 'Mở ứng dụng',
    CLEAR_HISTORY: 'Xóa lịch sử',
    QUIT: 'Thoát',
    HISTORY_EMPTY: 'Lịch sử trống',
  },
  NOTIFICATIONS: {
    COPIED_TITLE: 'Đã sao chép',
    COPIED_BODY: 'Nội dung đã được lưu vào bộ nhớ tạm',
  },
  AUTH: {
    LOGIN_TITLE: 'Đăng nhập QuickClip',
    REGISTER_TITLE: 'Đăng ký QuickClip',
    ALREADY_HAVE_ACCOUNT: 'Đã có tài khoản? Đăng nhập',
    NEED_ACCOUNT: 'Chưa có tài khoản? Đăng ký',
    INVALID_CREDENTIALS: 'Thông tin không hợp lệ',
    REGISTRATION_FAILED: 'Đăng ký thất bại',
    LOGIN_FAILED: 'Đăng nhập thất bại',
    CLIENT_NOT_INIT:
      'Neon Auth client chưa được khởi tạo. Vui lòng kiểm tra NEON_AUTH_URL trong file .env',
    URL_NOT_CONFIG: 'Neon Auth URL chưa được cấu hình trong file .env',
    USER_NOT_FOUND: 'Không tìm thấy người dùng trong hệ thống',
  },
  ERRORS: {
    DB_INIT_FAILED: 'Khởi tạo DB thất bại:',
    SYNC_FAILED: 'Đồng bộ thất bại:',
  },
} as const;
