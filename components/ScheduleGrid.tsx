import { useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, useWindowDimensions,
} from 'react-native';
import type { Employee, Shift } from '../db/database';
import { getRoleColor } from '../constants/roles';

const HEADER_H = 54;
const ROW_H = 78;
const DAYS = 7;

// Mobile fixed sizes
const EMP_W_MOBILE = 130;
const DAY_W_MOBILE = 92;

// Wide breakpoint
const WIDE = 768;

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDayHeader(dateStr: string): { weekday: string; date: string } {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    date: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
  };
}

type Props = {
  dates: string[];
  employees: Employee[];
  shifts: Shift[];
  onAddShift: (date: string, employeeId: number) => void;
  onEditShift: (shift: Shift) => void;
};

export default function ScheduleGrid({ dates, employees, shifts, onAddShift, onEditShift }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const isWide = screenWidth >= WIDE;

  // On wide screens, divide remaining width evenly across 7 day columns
  const empW = isWide ? Math.max(160, Math.floor(screenWidth * 0.14)) : EMP_W_MOBILE;
  const dayW = isWide
    ? Math.floor((screenWidth - empW) / DAYS)
    : DAY_W_MOBILE;

  const today = todayString();
  const headerScrollRef = useRef<ScrollView>(null);
  const rowScrollRefs = useRef<(ScrollView | null)[]>([]);
  const scrollX = useRef(0);

  const syncScroll = useCallback((sourceIdx: number, x: number) => {
    scrollX.current = x;
    headerScrollRef.current?.scrollTo({ x, animated: false });
    rowScrollRefs.current.forEach((ref, i) => {
      if (i !== sourceIdx) ref?.scrollTo({ x, animated: false });
    });
  }, []);

  if (employees.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No staff added yet</Text>
        <Text style={styles.emptyHint}>Tap the Staff button to add employees.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed header row */}
      <View style={[styles.headerRow, { height: HEADER_H }]}>
        <View style={[styles.cornerCell, { width: empW }]}>
          <Text style={styles.cornerText}>STAFF</Text>
        </View>
        <ScrollView
          ref={headerScrollRef}
          horizontal
          scrollEnabled={!isWide}
          showsHorizontalScrollIndicator={false}
          style={isWide ? styles.headerScrollWide : undefined}
        >
          {dates.map(dateStr => {
            const { weekday, date } = parseDayHeader(dateStr);
            const isToday = dateStr === today;
            return (
              <View
                key={dateStr}
                style={[styles.dayHeader, { width: dayW, height: HEADER_H }, isToday && styles.dayHeaderToday]}
              >
                <Text style={[styles.dayWeekday, isToday && styles.dayTextToday]}>{weekday}</Text>
                <Text style={[styles.dayDate, isToday && styles.dayTextToday]}>{date}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Scrollable employee rows */}
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {employees.map((emp, rowIdx) => (
          <View key={emp.id} style={[styles.row, { height: ROW_H }, rowIdx % 2 === 1 && styles.rowAlt]}>
            {/* Fixed employee name cell */}
            <View style={[styles.empCell, { width: empW }]}>
              <View style={[styles.roleBar, { backgroundColor: getRoleColor(emp.role) }]} />
              <View style={styles.empText}>
                <Text style={styles.empName} numberOfLines={1}>{emp.name}</Text>
                <Text style={styles.empRole} numberOfLines={2}>{emp.role}</Text>
              </View>
            </View>

            {/* Day cells — horizontally scrollable on mobile, full-width on wide */}
            <ScrollView
              horizontal
              ref={r => { rowScrollRefs.current[rowIdx] = r; }}
              onScroll={isWide ? undefined : e => syncScroll(rowIdx, e.nativeEvent.contentOffset.x)}
              scrollEventThrottle={16}
              scrollEnabled={!isWide}
              showsHorizontalScrollIndicator={!isWide && rowIdx === employees.length - 1}
            >
              {dates.map(dateStr => {
                const isToday = dateStr === today;
                const shift = shifts.find(s => s.employee_id === emp.id && s.date === dateStr);
                return (
                  <View
                    key={dateStr}
                    style={[styles.cell, { width: dayW, height: ROW_H }, isToday && styles.cellToday]}
                  >
                    {shift ? (
                      <TouchableOpacity
                        style={[styles.shiftBlock, { width: dayW - 12, backgroundColor: getRoleColor(emp.role) }]}
                        onPress={() => onEditShift(shift)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.shiftTime}>{shift.start_time}</Text>
                        <Text style={styles.shiftDash}>–</Text>
                        <Text style={styles.shiftTime}>{shift.end_time}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => onAddShift(dateStr, emp.id)}
                        activeOpacity={0.6}
                      >
                        <Text style={styles.addBtnText}>+</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#1d1d1f' },
  emptyHint: { fontSize: 14, color: '#6e6e73', textAlign: 'center' },

  // Header
  headerRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  headerScrollWide: { flex: 1 },
  cornerCell: {
    justifyContent: 'flex-end',
    paddingLeft: 12,
    paddingBottom: 8,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  cornerText: { fontSize: 10, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.8 },
  dayHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#e0e0e0',
  },
  dayHeaderToday: { backgroundColor: '#EBF4FF' },
  dayWeekday: { fontSize: 10, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 },
  dayDate: { fontSize: 16, fontWeight: '700', color: '#1d1d1f' },
  dayTextToday: { color: '#007AFF' },

  // Rows
  body: { flex: 1 },
  row: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  rowAlt: { backgroundColor: '#FAFAFA' },

  // Employee cell
  empCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  roleBar: { width: 4, alignSelf: 'stretch', marginVertical: 14, borderRadius: 2, flexShrink: 0 },
  empText: { flex: 1 },
  empName: { fontSize: 12, fontWeight: '600', color: '#1d1d1f' },
  empRole: { fontSize: 10, color: '#6e6e73', marginTop: 2, lineHeight: 13 },

  // Day cells
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#e0e0e0',
  },
  cellToday: { backgroundColor: '#F0F7FF' },

  shiftBlock: {
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 1,
  },
  shiftTime: { fontSize: 11, fontWeight: '700', color: 'white' },
  shiftDash: { fontSize: 9, color: 'rgba(255,255,255,0.7)' },

  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F2F7',
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 22, color: '#8E8E93', lineHeight: 26, marginTop: -1 },
});
