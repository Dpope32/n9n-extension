# Design Document

## Overview

The server-side testing framework will provide comprehensive validation of all Supabase CRUD operations for the n9n AI Copilot extension. The design focuses on creating a robust, isolated testing environment that can validate backend functionality independently of client-side issues.

## Architecture

### Testing Framework Structure

```
tests/
├── setup/
│   ├── test-config.js          # Test configuration and environment setup
│   ├── supabase-client.js      # Dedicated test Supabase client
│   └── test-data-factory.js    # Test data generation utilities
├── unit/
│   ├── conversation-crud.test.js    # Conversation CRUD operations
│   ├── message-crud.test.js         # Message CRUD operations
│   └── error-handling.test.js       # Error scenarios and edge cases
├── integration/
│   ├── chat-flow.test.js           # End-to-end conversation flows
│   └── fallback-behavior.test.js   # localStorage fallback testing
├── performance/
│   ├── load-testing.test.js        # Performance and stress tests
│   └── concurrent-ops.test.js      # Concurrent operation testing
└── utils/
    ├── test-helpers.js             # Common test utilities
    └── cleanup.js                  # Test data cleanup utilities
```

### Test Runner Configuration

**Jest Framework** - Primary testing framework with async/await support
- **Test Environment**: Node.js with fetch polyfill for Supabase requests
- **Test Database**: Dedicated test schema or separate Supabase project
- **Isolation**: Each test suite runs in isolated environment with cleanup
- **Reporting**: JSON and HTML reports with coverage metrics

## Components and Interfaces

### TestSupabaseClient

```javascript
class TestSupabaseClient {
  constructor(testConfig)
  async makeRequest(method, table, data, params)
  async cleanup()
  async resetTestData()
}
```

**Responsibilities:**
- Manage test database connections
- Provide isolated test environment
- Handle test data cleanup
- Mirror production ChatManager API

### TestDataFactory

```javascript
class TestDataFactory {
  generateConversation(overrides = {})
  generateMessage(conversationId, overrides = {})
  generateUser(overrides = {})
  createTestDataSet(conversationCount, messagesPerConversation)
}
```

**Responsibilities:**
- Generate realistic test data
- Provide data variations for edge cases
- Support bulk data creation for performance tests
- Ensure data consistency across tests

### TestChatManager

```javascript
class TestChatManager extends ChatManager {
  constructor(testClient)
  async runInTestMode()
  async validateDataIntegrity()
  async simulateNetworkFailure()
}
```

**Responsibilities:**
- Extend production ChatManager for testing
- Provide test-specific methods
- Enable failure simulation
- Validate business logic

## Data Models

### Test Configuration Schema

```javascript
{
  supabase: {
    url: string,
    key: string,
    testSchema: string
  },
  testData: {
    cleanupAfterEach: boolean,
    seedData: boolean,
    maxTestRecords: number
  },
  performance: {
    concurrentUsers: number,
    messagesPerSecond: number,
    testDuration: number
  }
}
```

### Test Result Schema

```javascript
{
  testSuite: string,
  testName: string,
  status: 'pass' | 'fail' | 'skip',
  duration: number,
  assertions: {
    total: number,
    passed: number,
    failed: number
  },
  coverage: {
    functions: number,
    lines: number,
    branches: number
  },
  errors: Array<{
    message: string,
    stack: string,
    expected: any,
    actual: any
  }>
}
```

## Error Handling

### Test Failure Categories

1. **Assertion Failures**: Expected vs actual value mismatches
2. **Network Errors**: Supabase connection or API failures
3. **Data Integrity Issues**: Inconsistent or corrupted test data
4. **Performance Failures**: Response times exceeding thresholds
5. **Setup/Teardown Errors**: Test environment configuration issues

### Error Recovery Strategies

- **Retry Logic**: Automatic retry for transient network failures
- **Graceful Degradation**: Continue testing when non-critical operations fail
- **Detailed Logging**: Comprehensive error context for debugging
- **Test Isolation**: Prevent test failures from affecting other tests
- **Cleanup Guarantees**: Ensure test data cleanup even on failures

## Testing Strategy

### Unit Tests

**Conversation CRUD Operations:**
- Create conversation with valid data
- Read conversation by ID and user filters
- Update conversation metadata and message counts
- Delete conversation and verify cascade behavior
- Validate field constraints and data types

**Message CRUD Operations:**
- Create messages with different roles and content types
- Read messages with pagination and sorting
- Update message metadata and content
- Delete individual messages
- Validate message-conversation relationships

**Error Handling:**
- Invalid UUID handling
- Missing required fields
- Network timeout scenarios
- Authentication failures
- Rate limiting responses

### Integration Tests

**Complete Chat Flows:**
- Start new conversation → Add messages → Save → Load → Update
- Multiple conversation management
- Message history retrieval with proper ordering
- Conversation title generation and updates

**Fallback Behavior:**
- Supabase unavailable → localStorage fallback
- Network interruption during operations
- Partial data synchronization scenarios

### Performance Tests

**Load Testing:**
- Create 100+ conversations simultaneously
- Add 1000+ messages across multiple conversations
- Measure response times under load
- Test pagination with large datasets

**Concurrent Operations:**
- Multiple users creating conversations
- Simultaneous message additions to same conversation
- Race condition detection and handling

## Test Data Management

### Test Database Setup

```sql
-- Test schema isolation
CREATE SCHEMA IF NOT EXISTS test_n9n;

-- Test tables (mirror production)
CREATE TABLE test_n9n.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  total_messages INTEGER DEFAULT 0,
  ai_credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE test_n9n.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES test_n9n.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Cleanup Strategy

- **Before Each Test**: Clear test schema tables
- **After Each Test**: Remove created test data
- **Test Suite Completion**: Full schema cleanup
- **Emergency Cleanup**: Manual cleanup scripts for stuck data

## Implementation Phases

### Phase 1: Core Testing Infrastructure
- Set up Jest testing framework
- Create TestSupabaseClient and TestDataFactory
- Implement basic CRUD operation tests
- Establish test data cleanup procedures

### Phase 2: Comprehensive Test Coverage
- Add error handling and edge case tests
- Implement integration test scenarios
- Create performance and load tests
- Add test reporting and coverage metrics

### Phase 3: Advanced Testing Features
- Concurrent operation testing
- Stress testing and bottleneck identification
- Automated test execution and CI integration
- Performance regression detection