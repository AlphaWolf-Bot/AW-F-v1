import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Telegram WebApp
const telegramWebAppMock = {
  ready: jest.fn(),
  initData: '',
  initDataUnsafe: {},
  version: '6.0',
  platform: 'web',
  colorScheme: 'light',
  themeParams: {},
  isExpanded: false,
  viewportHeight: 0,
  viewportStableHeight: 0,
  headerColor: '',
  backgroundColor: '',
  isClosingConfirmationEnabled: false,
  onEvent: jest.fn(),
  offEvent: jest.fn(),
  sendData: jest.fn(),
  openLink: jest.fn(),
  openTelegramLink: jest.fn(),
  openInvoice: jest.fn(),
  showPopup: jest.fn(),
  showAlert: jest.fn(),
  showConfirm: jest.fn(),
  enableClosingConfirmation: jest.fn(),
  disableClosingConfirmation: jest.fn(),
  setHeaderColor: jest.fn(),
  setBackgroundColor: jest.fn(),
  expand: jest.fn(),
  close: jest.fn(),
};

Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: telegramWebAppMock,
  },
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
}); 