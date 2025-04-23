const automationObj = {
  name: "some name",
  description: "some description",
  status: "draft",
  version: 1.0,
  is_active: true,
  tenant_id: "tenant_123",
  priority: 0,
  tags: JSON.stringify(["lead", "enrichment", "recruitment"]),
  metrics: {},
  triggers: {},
  actions: {},
};

// Note: Database operations must have a rollback/commit feature to rollback if subsequent operations fail (optionally configurable by user)

// types of triggers

/**
 * Event based
 * Recurring (constant intervals) -- (cron jobs)
 * Manually triggered
 * Hybrid
 */

// types of rules

/**
 * Switch
 * Evaluation
 * Validation
 * Time
 * Pattern
 * Authorization/Authentication
 * User
 */

// types of actions

/**
 *
 * Pull a record from table (constant|dynamic)
 * Update a record (constant|dynamic)
 * Create a record (dynamic) // cannot have constant since it will violate unique constraints
 * External API (REST)
 * Internal API (REST)
 * Iterate
 * Transform
 * Email
 * Notification
 * Aggregate (lists|objects)
 * Route
 * Use integration (plugins)
 * Delay (with optional and/or conditions)
 * Type Conversion
 * Validate Email
 * Analyze Document
 * Validate data (value|schema)
 * Terminate
 * Ignore
 * Fail
 * LOG
 * EXIT
 * Upload file
 * Debounce/Batch
 */
