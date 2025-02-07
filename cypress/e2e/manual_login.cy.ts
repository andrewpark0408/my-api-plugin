describe("Manual Login Flow", () => {
  beforeEach(() => {
    cy.visit("/"); // Visit the homepage before each test
  });

  it("should log in as admin", () => {
    cy.get("input[type='email']").type("admin@example.com");
    cy.get("input[type='password']").type("123");
    cy.get("button[type='submit']").click();

    // Confirm successful login
    cy.contains("Welcome, Test Admin!");
    cy.contains("Your role is: admin");
    cy.contains("Go to Admin Page");
  });

  it("should log in as user", () => {
    cy.get("input[type='email']").type("user@example.com");
    cy.get("input[type='password']").type("123");
    cy.get("button[type='submit']").click();

    // Confirm successful login
    cy.contains("Welcome, Test User!");
    cy.contains("Your role is: user");
    cy.get("Go to Admin Page").should("not.exist"); // User should NOT see admin link
  });

  it("should show error for wrong credentials", () => {
    cy.get("input[type='email']").type("user@example.com");
    cy.get("input[type='password']").type("wrongpassword");
    cy.get("button[type='submit']").click();

    // Expect an error message
    cy.contains("Invalid credentials. Please try again.");
  });

  it("should show Google Sign-In button", () => {
    cy.contains("Sign In with Google").should("be.visible");
  });

  it("should sign out successfully", () => {
    cy.get("input[type='email']").type("admin@example.com");
    cy.get("input[type='password']").type("123");
    cy.get("button[type='submit']").click();

    cy.contains("Sign Out").click();
    cy.contains("Sign In with Google"); // Should be back at login page
  });
});
