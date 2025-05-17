// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here
      login(): Chainable<void>;
      logout(): Chainable<void>;
      mockTelegramWebApp(): Chainable<void>;
      mockSocketConnection(): Chainable<void>;
    }
  }
}

// Mock Telegram WebApp
Cypress.Commands.add('mockTelegramWebApp', () => {
  cy.window().then((win) => {
    win.Telegram = {
      WebApp: {
        ready: () => {},
        initData: 'test-init-data',
        initDataUnsafe: {
          user: {
            id: 123456789,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
          },
        },
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
        onEvent: cy.stub(),
        offEvent: cy.stub(),
        sendData: cy.stub(),
        openLink: cy.stub(),
        openTelegramLink: cy.stub(),
        openInvoice: cy.stub(),
        showPopup: cy.stub(),
        showAlert: cy.stub(),
        showConfirm: cy.stub(),
        enableClosingConfirmation: cy.stub(),
        disableClosingConfirmation: cy.stub(),
        setHeaderColor: cy.stub(),
        setBackgroundColor: cy.stub(),
        expand: cy.stub(),
        close: cy.stub(),
      },
    };
  });
});

// Mock WebSocket connection
Cypress.Commands.add('mockSocketConnection', () => {
  cy.intercept('GET', '/socket.io/*', {
    statusCode: 200,
  }).as('socketConnection');
});

// Login command
Cypress.Commands.add('login', () => {
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      user: {
        id: '1',
        telegramId: '123456789',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        coinBalance: 1000,
        totalEarned: 1000,
        level: 1,
        tapsRemaining: 100,
        referralCode: 'ABC123',
      },
      token: 'test-token',
    },
  }).as('loginRequest');

  cy.get('[data-testid="login-button"]').click();
  cy.wait('@loginRequest');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/');
}); 