describe("Admin Invoice Management", () => {
  beforeEach(() => {
    cy.visit("/");

    // Log in as admin
    cy.get("input[type='email']").type("admin@example.com");
    cy.get("input[type='password']").type("123");
    cy.get("button[type='submit']").click();

    // Navigate to admin page
    cy.contains("Go to Admin Page").click();
    cy.url().should("include", "/admin");
    cy.contains("Admin - Invoice Management");
  });

  it("should allow admin to edit an invoice", () => {
    cy.contains("button", "Edit").click();

    // Change the invoice details
    cy.get("input[placeholder='Company Name']").clear().type("Updated Invoice");
    cy.contains("button", "Save Changes").click();

    // Verify the updated invoice
    cy.contains("Updated Invoice");
  });

  it("should allow admin to delete an invoice", () => {
    cy.contains("Delete").first().click();

    // Ensure the invoice is removed
    cy.contains("Test Invoice").should("not.exist");
  });
});
