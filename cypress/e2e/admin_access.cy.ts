describe("Admin Page Access Control", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should allow admin to access the admin page", () => {
    cy.get("input[type='email']").type("admin@example.com");
    cy.get("input[type='password']").type("123");
    cy.get("button[type='submit']").click();

    cy.contains("Go to Admin Page").click();

    // Admin should see admin-specific content
    cy.url().should("include", "/admin");
    cy.contains("Admin - Invoice Management");
  });

  it("should deny access to the admin page for a regular user", () => {
    cy.get("input[type='email']").type("user@example.com");
    cy.get("input[type='password']").type("123");
    cy.get("button[type='submit']").click();

    cy.visit("/admin");

    // User should see an access denied message
    cy.contains("Access Denied").should("be.visible");
  });
});
