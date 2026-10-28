/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Animal,
  VaccineRecord,
  HealthIssue,
  BreedingRecord,
  MilkLog,
  Customer,
  PaymentTransaction,
  ExpenseRecord,
  FeedRecord,
  SaleRecord
} from '../types';

export const DB_KEYS = {
  ANIMALS: 'dairy_db_animals',
  MILK: 'dairy_db_milk_production',
  EXPENSES: 'dairy_db_expenses',
  FEED: 'dairy_db_feed_ration',
  BREEDING: 'dairy_db_breeding',
  VACCINES: 'dairy_db_vaccination',
  HEALTH: 'dairy_db_health_issues',
  CUSTOMERS: 'dairy_db_customers',
  PAYMENTS: 'dairy_db_payment_history',
  SALES: 'dairy_db_sales'
} as const;

export interface DatabaseStats {
  connected: boolean;
  tableCount: number;
  totalRecords: number;
  storageSizeBytes: number;
  lastSyncTime: string;
}

class DairyDatabaseService {
  private listeners: ((tableName: string, count: number) => void)[] = [];

  // Generic getter with fallback and legacy key migration
  getTable<T>(tableKey: string, legacyKey?: string, defaultData: T[] = []): T[] {
    try {
      const data = localStorage.getItem(tableKey);
      if (data) {
        return JSON.parse(data);
      }
      if (legacyKey) {
        const legacyData = localStorage.getItem(legacyKey);
        if (legacyData) {
          const parsed = JSON.parse(legacyData);
          // migrate to new primary tableKey
          this.saveTable(tableKey, parsed);
          return parsed;
        }
      }
      // Save default
      this.saveTable(tableKey, defaultData);
      return defaultData;
    } catch (err) {
      console.error(`Error loading table ${tableKey}:`, err);
      return defaultData;
    }
  }

  saveTable<T>(tableKey: string, data: T[]): void {
    try {
      localStorage.setItem(tableKey, JSON.stringify(data));
      this.notifyListeners(tableKey, data.length);
    } catch (err) {
      console.error(`Error saving table ${tableKey}:`, err);
    }
  }

  onSave(cb: (tableName: string, count: number) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notifyListeners(tableName: string, count: number) {
    this.listeners.forEach(fn => fn(tableName, count));
  }

  getStats(): DatabaseStats {
    let totalRecords = 0;
    let sizeBytes = 0;
    const keys = Object.values(DB_KEYS);

    keys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        sizeBytes += item.length * 2; // Approximate UTF-16 byte size
        try {
          const arr = JSON.parse(item);
          if (Array.isArray(arr)) totalRecords += arr.length;
        } catch { }
      }
    });

    return {
      connected: true,
      tableCount: keys.length,
      totalRecords,
      storageSizeBytes: sizeBytes,
      lastSyncTime: new Date().toLocaleTimeString()
    };
  }

  exportFullBackup(): string {
    const backup: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      appName: 'Dairy Farm Management ERP',
      version: '2.0.0',
      tables: {}
    };

    Object.entries(DB_KEYS).forEach(([name, key]) => {
      const data = localStorage.getItem(key);
      backup.tables[name] = data ? JSON.parse(data) : [];
    });

    return JSON.stringify(backup, null, 2);
  }

  importFullBackup(jsonContent: string): boolean {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed.tables) return false;

      Object.entries(DB_KEYS).forEach(([name, key]) => {
        if (parsed.tables[name] && Array.isArray(parsed.tables[name])) {
          localStorage.setItem(key, JSON.stringify(parsed.tables[name]));
        }
      });
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }
}

export const dairyDb = new DairyDatabaseService();
