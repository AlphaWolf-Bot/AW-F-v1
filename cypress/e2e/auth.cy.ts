describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then((win) => {
      // Mock Telegram WebApp
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

  it('should handle successful login', () => {
    // Mock successful API response
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

    // Mock WebSocket connection
    cy.intercept('GET', '/socket.io/*', {
      statusCode: 200,
    }).as('socketConnection');

    // Click login button
    cy.get('[data-testid="login-button"]').click();

    // Wait for login request
    cy.wait('@loginRequest');

    // Verify user is redirected to home page
    cy.url().should('include', '/home');

    // Verify user data is displayed
    cy.get('[data-testid="user-balance"]').should('contain', '1,000');
    cy.get('[data-testid="user-level"]').should('contain', 'Level 1');
  });

  it('should handle login error', () => {
    // Mock failed API response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        error: 'Invalid credentials',
      },
    }).as('loginRequest');

    // Click login button
    cy.get('[data-testid="login-button"]').click();

    // Wait for login request
    cy.wait('@loginRequest');

    // Verify error message is displayed
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');

    // Verify user is not redirected
    cy.url().should('not.include', '/home');
  });

  it('should handle missing Telegram WebApp', () => {
    // Remove Telegram WebApp mock
    cy.window().then((win) => {
      delete win.Telegram;
    });

    // Click login button
    cy.get('[data-testid="login-button"]').click();

    // Verify error message is displayed
    cy.get('[data-testid="error-message"]').should('contain', 'Telegram Web App not initialized');
  });

  it('should handle token refresh', () => {
    // Mock successful login
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
        refreshToken: 'test-refresh-token',
        expiresIn: 3600,
      },
    }).as('loginRequest');

    // Mock token refresh
    cy.intercept('POST', '/api/auth/refresh', {
      statusCode: 200,
      body: {
        accessToken: 'new-test-token',
        refreshToken: 'new-test-refresh-token',
        expiresIn: 3600,
      },
    }).as('refreshRequest');

    // Login first
    cy.get('[data-testid="login-button"]').click();
    cy.wait('@loginRequest');

    // Simulate token expiry
    cy.window().then((win) => {
      win.localStorage.setItem('token_expiry', (Date.now() - 1000).toString());
    });

    // Trigger an API request that should refresh the token
    cy.intercept('GET', '/api/user/profile', {
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
      },
    }).as('profileRequest');

    // Visit profile page to trigger refresh
    cy.visit('/profile');
    cy.wait('@refreshRequest');
    cy.wait('@profileRequest');

    // Verify new token is set
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.exist;
    });
  });

  it('should handle logout', () => {
    // Mock successful login first
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

    // Login
    cy.get('[data-testid="login-button"]').click();
    cy.wait('@loginRequest');

    // Click logout button
    cy.get('[data-testid="logout-button"]').click();

    // Verify user is redirected to login page
    cy.url().should('include', '/');

    // Verify tokens are cleared
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
      expect(win.localStorage.getItem('refresh_token')).to.be.null;
    });

    // Verify user data is not displayed
    cy.get('[data-testid="user-balance"]').should('not.exist');
  });
}); 