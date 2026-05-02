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

type RawShift = { id: number; employee_id: number; date: string; start_time: string; end_time: string };

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

function save(key: string, data: unknown[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function nextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map(i => i.id)) + 1;
}

export function initDatabase() {}

export function getEmployees(): Employee[] {
  return load<Employee>('employees').sort((a, b) => a.name.localeCompare(b.name));
}

export function addEmployee(name: string, role: 'tech' | 'manager'): void {
  const employees = load<Employee>('employees');
  employees.push({ id: nextId(employees), name, role });
  save('employees', employees);
}

export function deleteEmployee(id: number): void {
  save('employees', load<Employee>('employees').filter(e => e.id !== id));
  save('shifts', load<RawShift>('shifts').filter(s => s.employee_id !== id));
}

export function getShiftsForWeek(weekStart: string): Shift[] {
  const employees = load<Employee>('employees');
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return load<RawShift>('shifts')
    .filter(s => { const d = new Date(s.date + 'T00:00:00'); return d >= start && d < end; })
    .map(s => {
      const emp = employees.find(e => e.id === s.employee_id);
      return { ...s, employee_name: emp?.name ?? 'Unknown', role: emp?.role ?? 'tech' };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
}

export function addShift(employee_id: number, date: string, start_time: string, end_time: string): void {
  const shifts = load<RawShift>('shifts');
  shifts.push({ id: nextId(shifts), employee_id, date, start_time, end_time });
  save('shifts', shifts);
}

export function updateShift(id: number, employee_id: number, start_time: string, end_time: string): void {
  save('shifts', load<RawShift>('shifts').map(s =>
    s.id === id ? { ...s, employee_id, start_time, end_time } : s
  ));
}

export function deleteShift(id: number): void {
  save('shifts', load<RawShift>('shifts').filter(s => s.id !== id));
}
