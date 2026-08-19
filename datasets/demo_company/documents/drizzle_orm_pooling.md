<!-- SYNTHETIC DEVELOPMENT / EVALUATION DATA -->
# Drizzle ORM Connection Pooling Best Practices

This guide provides recommended settings for connection pooling in high-concurrency environments when using Drizzle ORM.

## Connection Pool Sizes
For high concurrency applications, the recommended connection pool sizes are:
- For standard production workloads: A pool size of 20 to 50 connections per database instance.
- For maximum peak traffic and high concurrency: A pool size of 80 to 100 connections is recommended, combined with a connection timeout of 5000ms.
- Always set the idle timeout to 30 seconds to automatically prune unused connections and prevent resource exhaustion.
