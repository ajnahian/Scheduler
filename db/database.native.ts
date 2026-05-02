import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('scheduler.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'tech'
    );
    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL
    );
  `);
}

export type Employee = { id: number; name: string; role: 'tech' | 'manager' };
export type Shift = {
  id: number;
  employee_id: number;
  employee_name: string;
  role: string;
  date: string;
  start_time: string;
  end_time: string;
};

export function getEmployees(): Employee[] {
  return db.getAllSync('SELECT * FROM employees ORDER BY name');
}

export function addEmployee(name: string, role: 'tech' | 'manager'): void {
  db.runSync('INSERT INTO employees (name, role) VALUES (?, ?)', name, role);
}

export function deleteEmployee(id: number): void {
  db.runSync('DELETE FROM shifts WHERE employee_id = ?', id);
  db.runSync('DELETE FROM employees WHERE id = ?', id);
}

export function getShiftsForWeek(weekStart: string): Shift[] {
  return db.getAllSync(
    `SELECT s.id, s.employee_id, s.date, s.start_time, s.end_time,
            e.name AS employee_name, e.role
     FROM shifts s
     JOIN employees e ON s.employee_id = e.id
     WHERE s.date >= ? AND s.date < date(?, '+7 days')
     ORDER BY s.date, s.start_time`,
    weekStart,
    weekStart
  );
}

export function addShift(
  employee_id: number,
  date: string,
  start_time: string,
  end_time: string
): void {
  db.runSync(
    'INSERT INTO shifts (employee_id, date, start_time, end_time) VALUES (?, ?, ?, ?)',
    employee_id, date, start_time, end_time
  );
}

export function updateShift(
  id: number,
  employee_id: number,
  start_time: string,
  end_time: string
): void {
  db.runSync(
    'UPDATE shifts SET employee_id = ?, start_time = ?, end_time = ? WHERE id = ?',
    employee_id, start_time, end_time, id
  );
}

export function deleteShift(id: number): void {
  db.runSync('DELETE FROM shifts WHERE id = ?', id);
}
