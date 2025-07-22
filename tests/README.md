# n9n AI Copilot - Server-Side Testing Suite

This directory contains comprehensive server-side tests for the n9n AI Copilot Chrome extension's Supabase backend operations.

## Directory Structure

```
tests/
├── setup/                  # Test configuration and setup files
│   ├── test-config.js      # Test environment configuration
│   ├── jest.setup.js       # Jest setup and global utilities
│   ├── global-setup.js     # Global test setup (runs once before all tests)
│   ├── global-teardown.js  # Global test teardown (runs once after all tests)
│   └── setup.test.js       # Setup verification tests
├── unit/                   # Unit tests for individual components
├── integration/            # Integration tests for complete workflows
├── performance/            # Performance and load testing
└── utils/                  # Test utilities and helpers
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase test project (optional for basic setup verification)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure test environment (optional):
```bash
# Set environment variables for Supabase testing
export SUPABASE_TEST_URL="https://your-test-project.supabase.co"
export SUPABASE_TEST_ANON_KEY="your-test-anon-key"
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:performance

# Run tests in watch mode
npm run test:watch

# Run tests with verbose output
npm run test:verbose
```

## Test Configuration

The test suite uses `tests/setup/test-config.js` for configuration. Key settings include:

- **Supabase Configuration**: Test database connection settings
- **Test Data Management**: Cleanup and seeding options
- **Performance Parameters**: Load testing thresholds and limits
- **Error Simulation**: Network failure and timeout scenarios

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_TEST_URL` | Test Supabase project URL | `https://your-test-project.supabase.co` |
| `SUPABASE_TEST_ANON_KEY` | Test Supabase anonymous key | `your-test-anon-key` |
| `NODE_ENV` | Environment mode | `test` |
| `TEST_LOG_LEVEL` | Logging level for tests | `info` |

## Test Categories

### Unit Tests (`tests/unit/`)
- Individual CRUD operations for conversations and messages
- Data validation and business logic
- Error handling and edge cases

### Integration Tests (`tests/integration/`)
- Complete chat flow scenarios
- localStorage fallback behavior
- Multi-component interactions

### Performance Tests (`tests/performance/`)
- Load testing with concurrent operations
- Response time measurements
- Stress testing and bottleneck identification

## Writing Tests

### Basic Test Structure

```javascript
const { TEST_CONFIG } = require('../setup/test-config');

describe('Feature Name', () => {
  beforeEach(async () => {
    // Test setup
  });

  afterEach(async () => {
    // Test cleanup
  });

  test('should perform expected behavior', async () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Global Utilities

The test suite provides global utilities:

- `global.sleep(ms)` - Async sleep function
- `global.generateUUID()` - UUID generation
- `global.handleTestError(error, context)` - Error handling
- `global.TEST_CONFIG` - Test configuration object

## Test Data Management

- **Automatic Cleanup**: Test data is automatically cleaned up after each test
- **Data Isolation**: Each test runs with isolated test data
- **Test Factories**: Use `TestDataFactory` for generating realistic test data

## Troubleshooting

### Common Issues

1. **Configuration Warnings**: Update `test-config.js` with actual Supabase credentials
2. **Network Timeouts**: Increase timeout values in test configuration
3. **Test Data Conflicts**: Ensure proper cleanup in test teardown

### Debug Mode

Run tests with debug logging:

```bash
TEST_LOG_LEVEL=debug npm test
```

### CI/CD Integration

The test suite is configured for CI environments:

```bash
NODE_ENV=ci npm test
```

## Coverage Reports

Test coverage reports are generated in the `coverage/` directory:

- `coverage/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI integration

## Contributing

When adding new tests:

1. Follow the existing directory structure
2. Use descriptive test names and organize by feature
3. Include proper setup and teardown
4. Add documentation for complex test scenarios
5. Ensure tests are isolated and don't depend on external state

## Support

For questions about the testing setup, refer to:

- Test configuration: `tests/setup/test-config.js`
- Jest configuration: `jest.config.js`
- Setup verification: Run `npm test tests/setup/setup.test.js`