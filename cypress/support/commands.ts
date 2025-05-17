// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

// Utility function to wait for network requests to complete
Cypress.Commands.add('waitForNetworkIdle', (timeout = 5000) => {
  let lastRequestTime = Date.now();
  const checkInterval = 100;

  return new Cypress.Promise((resolve) => {
    const check = () => {
      const now = Date.now();
      if (now - lastRequestTime >= timeout) {
        resolve();
      } else {
        setTimeout(check, checkInterval);
      }
    };

    cy.intercept('*', (req) => {
      lastRequestTime = Date.now();
      req.continue();
    });

    check();
  });
});

// Utility function to check if element is in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height();
  const rect = subject[0].getBoundingClientRect();

  expect(rect.top).to.be.lessThan(bottom);
  expect(rect.bottom).to.be.greaterThan(0);
  return subject;
});

// Utility function to check if element is visible
Cypress.Commands.add('isVisible', { prevSubject: true }, (subject) => {
  const isVisible = (elem) => {
    const style = window.getComputedStyle(elem);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  };

  expect(isVisible(subject[0])).to.be.true;
  return subject;
});

// Utility function to check if element is enabled
Cypress.Commands.add('isEnabled', { prevSubject: true }, (subject) => {
  expect(subject[0]).to.not.be.disabled;
  return subject;
});

// Utility function to check if element has focus
Cypress.Commands.add('hasFocus', { prevSubject: true }, (subject) => {
  expect(subject[0]).to.equal(document.activeElement);
  return subject;
});

// Utility function to check if element has class
Cypress.Commands.add('hasClass', { prevSubject: true }, (subject, className) => {
  expect(subject[0]).to.have.class(className);
  return subject;
});

// Utility function to check if element has attribute
Cypress.Commands.add('hasAttribute', { prevSubject: true }, (subject, attr, value) => {
  if (value) {
    expect(subject[0]).to.have.attr(attr, value);
  } else {
    expect(subject[0]).to.have.attr(attr);
  }
  return subject;
});

// Utility function to check if element has text
Cypress.Commands.add('hasText', { prevSubject: true }, (subject, text) => {
  expect(subject[0]).to.have.text(text);
  return subject;
});

// Utility function to check if element has value
Cypress.Commands.add('hasValue', { prevSubject: true }, (subject, value) => {
  expect(subject[0]).to.have.value(value);
  return subject;
});

// Utility function to check if element is checked
Cypress.Commands.add('isChecked', { prevSubject: true }, (subject) => {
  expect(subject[0]).to.be.checked;
  return subject;
});

// Utility function to check if element is selected
Cypress.Commands.add('isSelected', { prevSubject: true }, (subject) => {
  expect(subject[0]).to.be.selected;
  return subject;
}); 