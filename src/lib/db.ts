// src/lib/db.ts
import mysql from 'mysql2/promise';

const promisePool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  typeCast: function (field, next) {
    if (field.name === 'screenshots') {
      const fieldValue = field.string('utf-8');
      if (fieldValue) {
        try {
          return JSON.parse(fieldValue);
        } catch (error) {
          console.error('JSON ayrıştırma hatası:', {
            error: (error as Error).message,
            field: field.name,
            table: field.table,
            value: fieldValue,
          });
          return null;
        }
      }
      return next();
    }
    return next();
  },
});

export default promisePool;