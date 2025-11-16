/**
 * Mock AppDataSource to use TestDataSource during tests
 * 
 * This file is loaded before any test files to ensure AppDataSource
 * is replaced with TestDataSource before any modules import it.
 * 
 * Uses a Proxy to delegate all property access to TestDataSource,
 * which will be initialized in setup.ts before tests run.
 */

import { TestDataSource } from '../config/test-data-source';

// Mock AppDataSource module to use TestDataSource
// TestDataSource will be initialized in setup.ts before tests run
jest.mock('../config/data-source', () => {
  // Create a proxy that delegates to TestDataSource
  // This allows TestDataSource to be initialized later
  return {
    AppDataSource: new Proxy(TestDataSource, {
      get: (target, prop) => {
        // Return property from TestDataSource
        return (target as any)[prop];
      },
    }),
  };
});

