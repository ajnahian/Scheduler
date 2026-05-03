import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  getShiftsForWeek, getEmployees, getClosingTime,
  addShift, updateShift, deleteShift,
  type Shift, type Employee,
} from '../db/database';
import ScheduleGrid from '../components/ScheduleGrid';
import ShiftDrawer from '../components/ShiftDrawer';
import { STAFF_TITLES, NIGHT_SHIFT_TITLE, getRoleColor } from '../constants/roles';

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

const REGULAR_TITLES = STAFF_TITLES.slice(0, 6);

export default function Index() {
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [closingTime, setClosingTime] = useState('21:00');
  const [drawerDate, setDrawerDate] = useState<string | null>(null);
  const [drawerShift, setDrawerShift] = useState<Shift | null>(null);
  const [drawerEmployeeId, setDrawerEmployeeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only redirect to /staff once on the very first load with no employees
  const didInitialRedirect = useRef(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [fetchedShifts, fetchedEmployees, ct] = await Promise.all([
        getShiftsForWeek(toDateString(weekStart)),
        getEmployees(),
        getClosingTime(),
      ]);
      setShifts(fetchedShifts);
      setEmployees(fetchedEmployees);
      setClosingTime(ct);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to connect to database.');
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  // Reload when week changes
  useEffect(() => { loadData(); }, [loadData]);

  // Reload when returning to this screen from /staff (picks up new employees)
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // On first load with no employees, navigate to staff setup
  useEffect(() => {
    if (!loading && !didInitialRedirect.current && employees.length === 0 && !error) {
      didInitialRedirect.current = true;
      router.replace('/staff');
    }
  }, [loading, employees.length, error]);

  const weekDates = Array.from({ length: 7 }, (_, i) => toDateString(addDays(weekStart, i)));

  const weekLabel = (() => {
    const end = addDays(weekStart, 6);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${weekStart.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
  })();

  const openAddShift = (date: string, employeeId?: number) => {
    setDrawerShift(null);
    setDrawerDate(date);
    setDrawerEmployeeId(employeeId ?? null);
  };
  const openEditShift = (shift: Shift) => {
    setDrawerShift(shift);
    setDrawerDate(shift.date);
    setDrawerEmployeeId(null);
  };
  const closeDrawer = () => {
    setDrawerDate(null);
    setDrawerShift(null);
    setDrawerEmployeeId(null);
  };

  const handleSave = async (employeeId: number, startTime: string, endTime: string) => {
    if (drawerShift) {
      await updateShift(drawerShift.id, employeeId, startTime, endTime);
    } else if (drawerDate) {
      await addShift(employeeId, drawerDate, startTime, endTime);
    }
    closeDrawer();
    loadData();
  };

  const handleDelete = async () => {
    if (drawerShift) await deleteShift(drawerShift.id);
    closeDrawer();
    loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.centerText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Week navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.weekNavBtn} onPress={() => setWeekStart(prev => addDays(prev, -7))}>
          <Text style={styles.weekNavText}>← Prev{'\n'}Week</Text>
        </TouchableOpacity>
        <View style={styles.weekInfo}>
          <Text style={styles.weekLabel}>{weekLabel}</Text>
          <Text style={styles.coverageLabel}>
            {shifts.length} shift{shifts.length !== 1 ? 's' : ''} this week
          </Text>
        </View>
        <TouchableOpacity style={styles.weekNavBtn} onPress={() => setWeekStart(prev => addDays(prev, 7))}>
          <Text style={[styles.weekNavText, styles.weekNavRight]}>Next{'\n'}Week →</Text>
        </TouchableOpacity>
      </View>

      {/* Today + Staff */}
      <View style={styles.subHeader}>
        <TouchableOpacity style={styles.todayBtn} onPress={() => setWeekStart(getWeekStart(new Date()))}>
          <Text style={styles.todayBtnText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.staffBtn} onPress={() => router.push('/staff')}>
          <Text style={styles.staffBtnText}>Staff</Text>
        </TouchableOpacity>
      </View>

      {/* Schedule grid */}
      <ScheduleGrid
        dates={weekDates}
        employees={employees}
        shifts={shifts}
        onAddShift={openAddShift}
        onEditShift={openEditShift}
      />

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          {REGULAR_TITLES.slice(0, 3).map(title => (
            <View key={title} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: getRoleColor(title) }]} />
              <Text style={styles.legendText} numberOfLines={1}>{title}</Text>
            </View>
          ))}
        </View>
        <View style={styles.legendRow}>
          {REGULAR_TITLES.slice(3, 6).map(title => (
            <View key={title} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: getRoleColor(title) }]} />
              <Text style={styles.legendText} numberOfLines={1}>{title}</Text>
            </View>
          ))}
        </View>
        <View style={styles.legendRowCenter}>
          <View style={[styles.legendDot, { backgroundColor: getRoleColor(NIGHT_SHIFT_TITLE) }]} />
          <Text style={styles.legendText} numberOfLines={1}>{NIGHT_SHIFT_TITLE}</Text>
        </View>
      </View>

      <ShiftDrawer
        visible={drawerDate !== null}
        date={drawerDate}
        shift={drawerShift}
        employees={employees}
        closingTime={closingTime}
        defaultEmployeeId={drawerEmployeeId}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={closeDrawer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 3,
  },
  weekNavBtn: { paddingHorizontal: 10, paddingVertical: 6, minWidth: 72 },
  weekNavText: { color: '#007AFF', fontSize: 13, fontWeight: '600', textAlign: 'left' },
  weekNavRight: { textAlign: 'right' },
  weekInfo: { flex: 1, alignItems: 'center' },
  weekLabel: { fontSize: 15, fontWeight: '700', color: '#1d1d1f' },
  coverageLabel: { fontSize: 12, color: '#6e6e73', marginTop: 1 },

  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  todayBtn: {
    borderWidth: 1, borderColor: '#007AFF', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  todayBtnText: { color: '#007AFF', fontWeight: '600', fontSize: 13 },
  staffBtn: {
    backgroundColor: '#007AFF', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  staffBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },

  legend: {
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  legendRow: { flexDirection: 'row', gap: 8 },
  legendRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  legendItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  legendText: { fontSize: 11, color: '#1d1d1f', flex: 1 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerText: { fontSize: 15, color: '#6e6e73' },
  errorTitle: { fontSize: 17, fontWeight: '600', color: '#1d1d1f', marginBottom: 8 },
  errorText: { fontSize: 14, color: '#6e6e73', textAlign: 'center', marginBottom: 20 },
  retryBtn: { backgroundColor: '#007AFF', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
});
