Feature: Add Product to Cart

  Scenario: Add a single product to the cart
    Given the user is on the product detail page for "Wireless Mouse"
    When the user clicks "Add to Cart"
    Then the cart should contain 1 item
    And the item should be "Wireless Mouse"
