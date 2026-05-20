/** E-commerce sample dataset shown after onboarding → Load sample data. */

export const PLAYGROUND_SAMPLE_SERVICE_ID = 'pg-ecommerce-demo'

export const PLAYGROUND_SAMPLE_SAVED_QUERIES = [
  'orders_last_7_days',
  'top_customers_by_revenue',
  'products_in_stock',
] as const

export const PLAYGROUND_SAMPLE_TABLES = [
  'customers',
  'orders',
  'products',
  'order_items',
] as const

export const PLAYGROUND_SAMPLE_VIEWS = ['customer_order_summary', 'product_sales'] as const

export const PLAYGROUND_SAMPLE_AI_PROMPTS = [
  'Which customers placed the most orders?',
  'Show order totals grouped by status',
  'Find products with fewer than 10 units in stock',
  'Summarize revenue from the orders table',
] as const

export const PLAYGROUND_SAMPLE_DEFAULT_SQL = `SELECT
  c.name,
  o.id AS order_id,
  o.total,
  o.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY o.created_at DESC
LIMIT 20;`
