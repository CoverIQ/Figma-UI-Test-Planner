Feature: User Login

  Scenario: Successful login with valid credentials
    Given the user is on the login page
    When the user enters "user@example.com" and "correct_password"
    And clicks the "Login" button
    Then the user should be redirected to the dashboard
    And see a welcome message
