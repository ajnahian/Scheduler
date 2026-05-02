import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export type Employee = { id: number; name: string; role: string };
export type Shift = {
  id: number;
  employee_id: number;
  employee_name: string;
  role: string;
  date: string;
  start_time: string;
  end_time: string;
};

type ShiftRow = {
  id: number;
  employee_id: number;
  date: string;
  start_time: string;
  end_time: string;
  employees: { name: string; role: string } | null;
};

export function initDatabase() {}

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name');
  if (error) throw error;
  return (data ?? []) as Employee[];
}

export async function addEmployee(name: string, role: string): Promise<void> {
  const { error } = await supabase.from('employees').insert({ name, role });
  if (error) throw error;
}

export async function deleteEmployee(id: number): Promise<void> {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) throw error;
}

export async function getShiftsForWeek(weekStart: string): Promise<Shift[]> {
  const end = new Date(weekStart + 'T00:00:00');
  end.setDate(end.getDate() + 7);
  const endDate = end.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('shifts')
    .select('id, employee_id, date, start_time, end_time, employees(name, role)')
    .gte('date', weekStart)
    .lt('date', endDate)
    .order('date')
    .order('start_time');

  if (error) throw error;

  return ((data ?? []) as ShiftRow[]).map(s => ({
    id: s.id,
    employee_id: s.employee_id,
    date: s.date,
    start_time: s.start_time,
    end_time: s.end_time,
    employee_name: s.employees?.name ?? 'Unknown',
    role: s.employees?.role ?? 'tech',
  }));
}

export async function addShift(
  employee_id: number,
  date: string,
  start_time: string,
  end_time: string
): Promise<void> {
  const { error } = await supabase
    .from('shifts')
    .insert({ employee_id, date, start_time, end_time });
  if (error) throw error;
}

export async function updateShift(
  id: number,
  employee_id: number,
  start_time: string,
  end_time: string
): Promise<void> {
  const { error } = await supabase
    .from('shifts')
    .update({ employee_id, start_time, end_time })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteShift(id: number): Promise<void> {
  const { error } = await supabase.from('shifts').delete().eq('id', id);
  if (error) throw error;
}
