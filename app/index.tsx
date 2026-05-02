import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import {
  initDatabase, getShiftsForWeek, getEmployees,
  addShift, updateShift, deleteShift,
  type Shift, type Employee,
} from '../db/database';
import WeekView from '../components/WeekView';
import ShiftDrawer from '../components/ShiftDrawer';
import EmployeesModal from '../components/EmployeesModal';

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function Index() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [drawerDate, setDrawerDate] = useState<string | null>(null);
  const [drawerShift, setDrawerShift] = useState<Shift | null>(null);
  const [showEmployees, setShowEmployees] = useState(false);

  const loadData = useCallback(() => {
    setShifts(getShiftsForWeek(toDateString(weekStart)));
    setEmployees(getEmployees());
  }, [weekStart]);

  useEffect(() => {
    initDatabase();
    loadData();
  }, [loadData]);

  const weekDates = Array.from({ length: 7 }, (_, i) => toDateString(addDays(weekStart, i)));

  const weekLabel = (() => {
    const end = addDays(weekStart, 6);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${weekStart.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
  })();

  const openAddShift = (date: string) => {
    setDrawerShift(null);
    setDrawerDate(date);
  };

  const openEditShift = (shift: Shift) => {
    setDrawerShift(shift);
    setDrawerDate(shift.date);
  };

  const closeDrawer = () => {
    setDrawerDate(null);
    setDrawerShift(null);
  };

  const handleSave = (employeeId: number, startTime: string, endTime: string) => {
    if (drawerShift) {
      updateShift(drawerShift.id, employeeId, startTime, endTime);
    } else if (drawerDate) {
      addShift(employeeId, drawerDate, startTime, endTime);
    }
    closeDrawer();
    loadData();
  };

  const handleDelete = () => {
    if (drawerShift) deleteShift(drawerShift.id);
    closeDrawer();
    loadData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.weekLabel}>{weekLabel}</Text>
          <Text style={styles.coverageLabel}>
            {shifts.length} shift{shifts.length !== 1 ? 's' : ''} this week
          </Text>
        </View>
        <TouchableOpacity style={styles.staffBtn} onPress={() => setShowEmployees(true)}>
          <Text style={styles.staffBtnText}>Staff</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekNav}>
        <TouchableOpacity onPress={() => setWeekStart(prev => addDays(prev, -7))} style={styles.navBtn}>
          <Text style={styles.navBtnText}>← Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setWeekStart(getWeekStart(new Date()))} style={styles.navBtn}>
          <Text style={styles.navBtnText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setWeekStart(prev => addDays(prev, 7))} style={styles.navBtn}>
          <Text style={styles.navBtnText}>Next →</Text>
        </TouchableOpacity>
      </View>

      <WeekView
        dates={weekDates}
        shifts={shifts}
        onAddShift={openAddShift}
        onEditShift={openEditShift}
      />

      <ShiftDrawer
        visible={drawerDate !== null}
        date={drawerDate}
        shift={drawerShift}
        employees={employees}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={closeDrawer}
      />

      <EmployeesModal
        visible={showEmployees}
        onClose={() => { setShowEmployees(false); loadData(); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'white',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  weekLabel: { fontSize: 16, fontWeight: '600', color: '#1d1d1f' },
  coverageLabel: { fontSize: 13, color: '#6e6e73', marginTop: 2 },
  staffBtn: {
    backgroundColor: '#007aff', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  staffBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  weekNav: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  navBtn: { padding: 4 },
  navBtnText: { color: '#007aff', fontSize: 14, fontWeight: '500' },
});
