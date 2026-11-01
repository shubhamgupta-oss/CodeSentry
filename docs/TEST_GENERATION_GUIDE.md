# Test Generation Guide

## Overview

CodeSentry generates tests from source you paste or load from a pull request. Send code to `POST /api/ai/generate-tests`. Supported `framework` values match the API: `jest`, `mocha`, `jasmine`, `pytest`, `unittest`, `python-selenium`, `java-selenium`, `cypress`, `playwright`, and `go-testing`. `testType` is `unit`, `integration`, `e2e`, or `all`.

See [API.md](API.md) for the request body and [TEST_EXAMPLES.md](TEST_EXAMPLES.md) for sample output. The model drafts the tests. Review them before you treat them as a real suite.

## Supported Frameworks

### JavaScript/TypeScript
- **Jest** - Modern testing framework with built-in mocking and code coverage
- **Mocha** - Flexible test framework with Chai assertions
- **Jasmine** - BDD-style testing framework
- **Cypress** - End-to-end testing for web applications
- **Playwright** - Cross-browser E2E testing

### Python
- **Pytest** - Powerful testing framework with fixtures and parameterization
- **Unittest** - Python's built-in testing framework
- **Python Selenium** - Web automation and testing with Selenium WebDriver

### Java
- **Java Selenium** - Web automation testing with JUnit integration

### Go
- **Go Testing** - Go's native testing framework with testify assertions

## Test Generation Scenarios

CodeSentry generates tests covering 12 comprehensive scenarios:

### 1. **Happy Path Tests**
Tests for normal successful execution with valid inputs
```
✓ Function executes successfully with valid input
✓ Returns expected output
✓ No side effects occur
```

### 2. **Boundary Tests**
Tests edge values and limits
```
✓ Minimum and maximum values
✓ Empty collections
✓ Zero and negative numbers
```

### 3. **Null/Undefined Handling**
Tests handling of null, undefined, and empty inputs
```
✓ Null parameters
✓ Undefined values
✓ Empty strings/arrays
```

### 4. **Type Validation**
Tests type checking and invalid type scenarios
```
✓ Wrong data types
✓ Type coercion behavior
✓ Mixed type inputs
```

### 5. **Error Handling**
Tests exception handling and error conditions
```
✓ Invalid operations
✓ Expected exceptions
✓ Error recovery
```

### 6. **Concurrency Tests**
Tests concurrent/async scenarios (where applicable)
```
✓ Promise resolution
✓ Async/await behavior
✓ Race conditions
```

### 7. **State Management**
Tests state management and side effects
```
✓ State mutations
✓ Global state changes
✓ Side effect tracking
```

### 8. **Performance Tests**
Tests with large datasets and performance characteristics
```
✓ Scalability with large inputs
✓ Memory efficiency
✓ Execution time
```

### 9. **Integration Tests**
Tests component interactions and dependency handling
```
✓ Dependency injection
✓ Component communication
✓ Integration points
```

### 10. **API Mocking**
Tests with mocked API responses
```
✓ Success responses
✓ Error responses
✓ Timeout scenarios
```

### 11. **Security Tests**
Tests input validation and injection prevention
```
✓ Input sanitization
✓ SQL injection prevention
✓ XSS prevention
✓ Authorization checks
```

### 12. **Accessibility Tests** (E2E)
Tests UI accessibility for E2E tests
```
✓ ARIA attributes
✓ Keyboard navigation
✓ Screen reader compatibility
```

## Test Coverage Target

Tests are generated to achieve your specified coverage target (default: 80%)

- **Unit Tests**: Internal function/method coverage
- **Integration Tests**: Component interaction coverage
- **E2E Tests**: User workflow coverage
- **Edge Case Tests**: Boundary and special case coverage
- **Security Tests**: Input validation and security concern coverage

## Generated Test Structure

### For Unit Tests (Jest/Mocha/Pytest)
```javascript
describe('Function Name', () => {
  let testData;
  
  beforeEach(() => {
    // Setup test fixtures
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  it('should perform expected action with valid input', () => {
    // Arrange
    const input = validTestData;
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toEqual(expectedOutput);
  });
});
```

### For Web Tests (Cypress/Playwright)
```javascript
describe('User Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  
  it('should successfully submit form', () => {
    cy.get('[data-testid="form"]').within(() => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});
```

### For Selenium Tests (Java/Python)
```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestLoginPage(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 10)
    
    def test_successful_login(self):
        self.driver.get("https://example.com/login")
        
        email_field = self.wait.until(
            EC.presence_of_element_located((By.ID, "email"))
        )
        email_field.send_keys("test@example.com")
        
        password_field = self.driver.find_element(By.ID, "password")
        password_field.send_keys("password123")
        
        submit_button = self.driver.find_element(By.ID, "login-btn")
        submit_button.click()
        
        self.wait.until(EC.url_contains("/dashboard"))
```

## Best Practices in Generated Tests

### 1. **Descriptive Test Names**
```
✓ test_should_validate_email_format_and_reject_invalid_addresses
✓ test_should_handle_concurrent_requests_without_race_conditions
✗ test_validation
```

### 2. **Isolation**
- Each test is independent
- No shared state between tests
- Proper setup and teardown

### 3. **Arrange-Act-Assert Pattern**
```
Arrange: Set up test data and mocks
Act: Execute the code being tested
Assert: Verify the results
```

### 4. **Meaningful Assertions**
```javascript
// Good
expect(userCount).toBe(5, 'Should have exactly 5 users after creation');

// Less helpful
expect(userCount).toBe(5);
```

### 5. **Mocking External Dependencies**
- Mock API calls
- Mock database queries
- Mock third-party services
- Focus on the unit being tested

### 6. **Parameterized Tests**
```python
@pytest.mark.parametrize('input,expected', [
    ('valid@email.com', True),
    ('invalid-email', False),
    ('', False),
    (None, False)
])
def test_email_validation(input, expected):
    assert validate_email(input) == expected
```

## Response Format

Each test generation response includes:

```json
{
  "tests": [
    {
      "name": "descriptive test name",
      "type": "unit|integration|e2e|boundary|security|performance",
      "scenario": "happy-path|boundary|null-undefined|etc",
      "description": "detailed description of what this test validates",
      "importance": "critical|high|medium|low",
      "code": "complete, production-ready test code"
    }
  ],
  "framework": "jest",
  "language": "javascript",
  "totalTests": 25,
  "coverage": {
    "unitTests": 15,
    "integrationTests": 5,
    "e2eTests": 3,
    "edgeCaseTests": 2,
    "securityTests": 0,
    "estimatedCoverage": 85
  },
  "setupInstructions": "npm install --save-dev jest",
  "runInstructions": "npm test",
  "summary": "Generated 25 comprehensive tests..."
}
```

## API Usage

### Request
```bash
POST /api/ai/generate-tests

{
  "code": "function to test",
  "language": "javascript",
  "framework": "jest",
  "testType": "all",
  "includeEdgeCases": true,
  "includeNegativeCases": true,
  "coverageTarget": 85
}
```

### Response
```json
{
  "success": true,
  "mode": "generate-tests",
  "framework": "jest",
  "supportedFrameworks": [
    "jest", "mocha", "jasmine", "pytest", "unittest",
    "python-selenium", "java-selenium", "cypress", "playwright", "go-testing"
  ],
  "data": {
    "tests": [...],
    "coverage": {...},
    "summary": "..."
  },
  "stats": {
    "testsGenerated": 25,
    "estimatedCoverage": 85,
    "testTypes": {
      "unit": 15,
      "integration": 5,
      "e2e": 3,
      "edge": 2,
      "security": 0
    }
  }
}
```

## Tips for Best Results

1. **Provide Complete Code**
   - Include all function parameters
   - Include return types
   - Include error handling

2. **Choose Appropriate Framework**
   - Unit testing: Jest, Pytest, Unittest
   - Web automation: Cypress, Selenium
   - Integration: Mocha, Pytest

3. **Specify Coverage Target**
   - Aim for 80-90% code coverage
   - Higher targets = more edge cases
   - Lower targets = fewer negative tests

4. **Include Edge Cases**
   - Enables boundary value testing
   - Stress tests your code
   - Catches subtle bugs

5. **Include Negative Cases**
   - Tests error handling
   - Validates error messages
   - Ensures resilience

## Common Frameworks Setup

### Jest
```bash
npm install --save-dev jest @types/jest
npx jest --init
npm test
```

### Pytest
```bash
pip install pytest pytest-cov
pytest tests/
pytest --cov=src
```

### Python Selenium
```bash
pip install selenium
# Download ChromeDriver: https://chromedriver.chromium.org/
```

### Java Selenium
```xml
<dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-java</artifactId>
    <version>4.x.x</version>
</dependency>
```

## Troubleshooting

### Issue: Tests Not Running
**Solution**: Check framework installation and configuration

### Issue: Import Errors
**Solution**: Verify all dependencies are installed in the environment

### Issue: Flaky Tests
**Solution**: Add explicit waits in E2E tests, use proper fixtures in unit tests

### Issue: Coverage Too Low
**Solution**: Increase `coverageTarget` or set `includeEdgeCases: true`

## Performance Considerations

- Unit tests: Fast (< 100ms per test)
- Integration tests: Medium (100ms - 1s)
- E2E tests: Slower (1s - 10s per test)
- Selenium tests: Depends on browser automation

## Future Enhancements

- Visual regression testing
- Performance benchmarking
- Coverage reports
- CI/CD integration
- Test data generation
- Mutation testing
- API contract testing

---

**Questions?** Check the [API documentation](./API.md) or contact support.
