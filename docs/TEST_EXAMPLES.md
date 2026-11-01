# Test Generation Examples

## Example 1: JavaScript Unit Testing with Jest

### Input Code
```javascript
function calculateDiscount(price, discountPercent, taxRate = 0.1) {
  if (!price || price < 0) {
    throw new Error('Invalid price');
  }
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Invalid discount percentage');
  }
  
  const discounted = price * (1 - discountPercent / 100);
  const withTax = discounted * (1 + taxRate);
  return Math.round(withTax * 100) / 100;
}
```

### Generated Tests (Sample)
```javascript
import { describe, it, expect } from '@jest/globals';

describe('calculateDiscount', () => {
  // Happy Path Tests
  it('should apply discount and tax correctly with valid inputs', () => {
    const result = calculateDiscount(100, 20, 0.1);
    expect(result).toBe(88); // 100 * 0.8 * 1.1 = 88
  });

  it('should use default tax rate of 10% when not provided', () => {
    const result = calculateDiscount(100, 10);
    expect(result).toBe(99); // 100 * 0.9 * 1.1 = 99
  });

  // Boundary Tests
  it('should reject a zero price because price is required', () => {
    expect(() => calculateDiscount(0, 50)).toThrow('Invalid price');
  });

  it('should handle 100% discount', () => {
    const result = calculateDiscount(100, 100);
    expect(result).toBe(0);
  });

  it('should handle 0% discount', () => {
    const result = calculateDiscount(100, 0);
    expect(result).toBe(110); // 100 * 1.1
  });

  // Error Cases
  it('should throw error for negative price', () => {
    expect(() => calculateDiscount(-50, 20)).toThrow('Invalid price');
  });

  it('should throw error for null price', () => {
    expect(() => calculateDiscount(null, 20)).toThrow('Invalid price');
  });

  it('should throw error for discount > 100%', () => {
    expect(() => calculateDiscount(100, 150)).toThrow('Invalid discount percentage');
  });

  it('should throw error for negative discount', () => {
    expect(() => calculateDiscount(100, -10)).toThrow('Invalid discount percentage');
  });

  // Edge Cases
  it('should handle very large prices', () => {
    const result = calculateDiscount(999999.99, 50);
    expect(result).toBeCloseTo(549999.99, 2);
  });

  it('should round to 2 decimal places', () => {
    const result = calculateDiscount(100, 33, 0.1);
    expect(result).toBe(73.37); // Should be properly rounded
  });
});
```

---

## Example 2: Python Unit Testing with Pytest

### Input Code
```python
def validate_email(email: str) -> bool:
    """Validate email format."""
    if not email or not isinstance(email, str):
        return False
    
    if '@' not in email or '.' not in email:
        return False
    
    parts = email.split('@')
    if len(parts) != 2:
        return False
    
    local, domain = parts
    if not local or not domain:
        return False
    
    if domain.count('.') == 0:
        return False
    
    return True
```

### Generated Tests (Sample)
```python
import pytest
from email_validator import validate_email

class TestValidateEmail:
    # Happy Path Tests
    def test_should_accept_valid_email(self):
        assert validate_email('test@example.com') is True
        assert validate_email('user.name+tag@domain.co.uk') is True
    
    # Boundary Tests
    def test_should_handle_minimum_valid_email(self):
        assert validate_email('a@b.c') is True
    
    # Null/Empty Tests
    def test_should_reject_none_input(self):
        assert validate_email(None) is False
    
    def test_should_reject_empty_string(self):
        assert validate_email('') is False
    
    # Format Tests
    def test_should_reject_email_without_at_symbol(self):
        assert validate_email('invalidemail.com') is False
    
    def test_should_reject_email_without_domain_dot(self):
        assert validate_email('user@domain') is False
    
    def test_should_reject_email_with_multiple_at_symbols(self):
        assert validate_email('user@@domain.com') is False
    
    def test_should_reject_email_with_empty_local_part(self):
        assert validate_email('@domain.com') is False
    
    def test_should_reject_email_with_empty_domain(self):
        assert validate_email('user@') is False
    
    # Type Tests
    def test_should_reject_non_string_input(self):
        assert validate_email(123) is False
        assert validate_email(['email@test.com']) is False

@pytest.mark.parametrize('email,expected', [
    ('valid@email.com', True),
    ('invalid@.com', False),
    ('@nodomain.com', False),
    ('noatsign.com', False),
    ('', False),
    (None, False)
])
def test_validate_email_parametrized(email, expected):
    assert validate_email(email) == expected
```

---

## Example 3: Python Selenium Web Testing

### Scenario: Test Login Functionality
```python
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class TestLoginPage(unittest.TestCase):
    """Test suite for login page functionality."""
    
    @classmethod
    def setUpClass(cls):
        """Set up Chrome driver options."""
        options = Options()
        options.add_argument("--start-maximized")
        options.add_argument("--disable-notifications")
        cls.driver = webdriver.Chrome(options=options)
        cls.wait = WebDriverWait(cls.driver, 10)
    
    def setUp(self):
        """Navigate to login page before each test."""
        self.driver.get("https://example.com/login")
    
    def tearDown(self):
        """Clean up after each test."""
        self.driver.delete_all_cookies()
    
    @classmethod
    def tearDownClass(cls):
        """Close browser after all tests."""
        cls.driver.quit()
    
    # Happy Path Test
    def test_successful_login_with_valid_credentials(self):
        """Test successful login with valid email and password."""
        # Arrange
        email_field = self.wait.until(
            EC.presence_of_element_located((By.ID, "email"))
        )
        password_field = self.driver.find_element(By.ID, "password")
        
        # Act
        email_field.send_keys("test@example.com")
        password_field.send_keys("validPassword123")
        
        login_button = self.driver.find_element(By.ID, "submit-login")
        login_button.click()
        
        # Assert
        self.wait.until(EC.url_contains("/dashboard"))
        dashboard_header = self.driver.find_element(By.CLASS_NAME, "welcome-message")
        self.assertIn("Welcome", dashboard_header.text)
    
    # Error Handling Test
    def test_login_fails_with_invalid_credentials(self):
        """Test login failure with invalid credentials."""
        email_field = self.wait.until(
            EC.presence_of_element_located((By.ID, "email"))
        )
        password_field = self.driver.find_element(By.ID, "password")
        
        email_field.send_keys("test@example.com")
        password_field.send_keys("wrongPassword")
        
        login_button = self.driver.find_element(By.ID, "submit-login")
        login_button.click()
        
        # Assert error message appears
        error_message = self.wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "error-message"))
        )
        self.assertIn("Invalid credentials", error_message.text)
    
    # Boundary Test - Empty Fields
    def test_login_fails_with_empty_email(self):
        """Test login validation with empty email field."""
        password_field = self.driver.find_element(By.ID, "password")
        password_field.send_keys("password123")
        
        login_button = self.driver.find_element(By.ID, "submit-login")
        login_button.click()
        
        error_message = self.wait.until(
            EC.presence_of_element_located((By.ID, "email-error"))
        )
        self.assertIn("Email is required", error_message.text)
    
    # Format Test
    def test_login_validates_email_format(self):
        """Test email format validation."""
        email_field = self.driver.find_element(By.ID, "email")
        password_field = self.driver.find_element(By.ID, "password")
        
        email_field.send_keys("invalidEmail")
        password_field.send_keys("password123")
        
        login_button = self.driver.find_element(By.ID, "submit-login")
        login_button.click()
        
        error_message = self.wait.until(
            EC.presence_of_element_located((By.ID, "email-error"))
        )
        self.assertIn("Invalid email format", error_message.text)
    
    # UI Interaction Test
    def test_password_visibility_toggle(self):
        """Test password field visibility toggle."""
        password_field = self.driver.find_element(By.ID, "password")
        toggle_button = self.driver.find_element(By.ID, "toggle-password")
        
        # Initially password should be hidden
        self.assertEqual(password_field.get_attribute("type"), "password")
        
        # Click toggle
        toggle_button.click()
        
        # Password should now be visible
        self.assertEqual(password_field.get_attribute("type"), "text")
    
    # Accessibility Test
    def test_login_form_has_proper_labels(self):
        """Test that form has proper accessibility labels."""
        email_label = self.driver.find_element(By.XPATH, "//label[@for='email']")
        password_label = self.driver.find_element(By.XPATH, "//label[@for='password']")
        
        self.assertEqual(email_label.text, "Email Address")
        self.assertEqual(password_label.text, "Password")
    
    # Performance Test
    def test_login_completes_within_reasonable_time(self):
        """Test that login completes within expected time."""
        import time
        
        start_time = time.time()
        
        email_field = self.wait.until(
            EC.presence_of_element_located((By.ID, "email"))
        )
        email_field.send_keys("test@example.com")
        
        password_field = self.driver.find_element(By.ID, "password")
        password_field.send_keys("validPassword123")
        
        login_button = self.driver.find_element(By.ID, "submit-login")
        login_button.click()
        
        self.wait.until(EC.url_contains("/dashboard"))
        
        elapsed_time = time.time() - start_time
        self.assertLess(elapsed_time, 5, "Login should complete within 5 seconds")

if __name__ == '__main__':
    unittest.main()
```

---

## Example 4: Java Selenium Web Testing

### Scenario: Test E-commerce Shopping Cart

```java
import static org.junit.Assert.*;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.interactions.Actions;
import java.time.Duration;

public class ShoppingCartTest {
    private WebDriver driver;
    private WebDriverWait wait;
    private Actions actions;
    
    @Before
    public void setUp() {
        System.setProperty("webdriver.chrome.driver", "path/to/chromedriver");
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        actions = new Actions(driver);
        driver.manage().window().maximize();
    }
    
    @After
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
    
    // Happy Path Test
    @Test
    public void testAddProductToCartAndCheckout() {
        // Arrange
        driver.get("https://example.com/shop");
        
        // Act
        WebElement product = wait.until(
            ExpectedConditions.elementToBeClickable(By.className("product-item"))
        );
        product.click();
        
        WebElement addToCartButton = wait.until(
            ExpectedConditions.elementToBeClickable(By.id("add-to-cart"))
        );
        addToCartButton.click();
        
        WebElement cartIcon = driver.findElement(By.className("cart-icon"));
        cartIcon.click();
        
        // Assert
        WebElement cartItem = wait.until(
            ExpectedConditions.presenceOfElementLocated(By.className("cart-item"))
        );
        assertNotNull(cartItem);
        assertTrue(cartItem.isDisplayed());
    }
    
    // Quantity Test
    @Test
    public void testUpdateProductQuantity() {
        driver.get("https://example.com/shop");
        
        WebElement product = wait.until(
            ExpectedConditions.elementToBeClickable(By.className("product-item"))
        );
        product.click();
        
        WebElement quantityInput = driver.findElement(By.id("quantity"));
        quantityInput.clear();
        quantityInput.sendKeys("5");
        
        WebElement addToCartButton = driver.findElement(By.id("add-to-cart"));
        addToCartButton.click();
        
        WebElement cartIcon = driver.findElement(By.className("cart-icon"));
        cartIcon.click();
        
        WebElement cartQuantity = wait.until(
            ExpectedConditions.presence_ofElementLocated(By.className("quantity"))
        );
        
        assertEquals("5", cartQuantity.getText());
    }
    
    // Error Test - Invalid Quantity
    @Test
    public void testErrorMessageForInvalidQuantity() {
        driver.get("https://example.com/shop");
        
        WebElement product = wait.until(
            ExpectedConditions.elementToBeClickable(By.className("product-item"))
        );
        product.click();
        
        WebElement quantityInput = driver.findElement(By.id("quantity"));
        quantityInput.clear();
        quantityInput.sendKeys("-1");
        
        WebElement addToCartButton = driver.findElement(By.id("add-to-cart"));
        addToCartButton.click();
        
        WebElement errorMessage = wait.until(
            ExpectedConditions.presence_ofElementLocated(By.className("error-message"))
        );
        assertThat(errorMessage.getText(), containsString("quantity must be positive"));
    }
    
    // Validation Test - Out of Stock
    @Test
    public void testCannotAddOutOfStockProduct() {
        driver.get("https://example.com/shop");
        
        WebElement outOfStockProduct = wait.until(
            ExpectedConditions.presence_ofElementLocated(By.xpath("//div[@class='product'][contains(text(), 'Out of Stock')]"))
        );
        
        WebElement addButton = outOfStockProduct.findElement(By.tagName("button"));
        assertFalse(addButton.isEnabled());
    }
    
    // UI Interaction Test
    @Test
    public void testToggleFreeShippingNotice() {
        driver.get("https://example.com/shop");
        
        WebElement freeShippingBanner = driver.findElement(By.className("shipping-banner"));
        assertTrue(freeShippingBanner.isDisplayed());
        
        WebElement closeButton = freeShippingBanner.findElement(By.className("close-btn"));
        closeButton.click();
        
        wait.until(ExpectedConditions.stalenessOf(freeShippingBanner));
        assertFalse(freeShippingBanner.isDisplayed());
    }
    
    // Performance Test
    @Test
    public void testPageLoadTimeWithinSLA() {
        long startTime = System.currentTimeMillis();
        
        driver.get("https://example.com/shop");
        
        wait.until(ExpectedConditions.presence_ofElementLocated(By.className("product-list")));
        
        long endTime = System.currentTimeMillis();
        long loadTime = endTime - startTime;
        
        assertTrue("Page should load within 2 seconds", loadTime < 2000);
    }
}
```

---

## Running the Generated Tests

### Jest
```bash
npm install --save-dev jest
npm test
npm test -- --coverage
```

### Pytest
```bash
pip install pytest pytest-cov
pytest tests/
pytest --cov=. --cov-report=html
```

### Python Selenium
```bash
pip install selenium
python -m pytest test_login.py -v
```

### Java Selenium
```bash
# With Maven
mvn test

# With Gradle
gradle test
```

---

## Coverage Report Examples

After running tests, you'll see detailed coverage reports:

```
PASS  calculateDiscount.test.js
  calculateDiscount
    ✓ should apply discount and tax correctly (5ms)
    ✓ should use default tax rate (2ms)
    ✓ should handle zero price (1ms)
    ...
    
Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Coverage: 95% (23/24 statements)
```

---

**Need help?** Check the [TEST_GENERATION_GUIDE.md](./TEST_GENERATION_GUIDE.md) for more details!
