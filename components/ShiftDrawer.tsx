import { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import type { Employee, Shift } from '../db/database';
import TimePicker from './TimePicker';
import { getRoleColor, isNightShift } from '../constants/roles';

const DURATIONS = [4, 5, 6, 7, 8, 9];

function calcEndTime(startTime: string, hours: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const total = h * 60 + m + hours * 60;
  const eh = Math.floor(total / 60) % 24;
  const em = total % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

function deriveDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = ((eh * 60 + em) - (sh * 60 + sm) + 1440) % 1440;
  const hours = Math.round(diff / 60);
  return Math.min(9, Math.max(4, hours));
}

function isDurationValid(
  startTime: string,
  hours: number,
  closingTime: string,
  nightShift: boolean,
): boolean {
  if (nightShift || !startTime) return true;
  const endTime = calcEndTime(startTime, hours);
  const [ch, cm] = closingTime.split(':').map(Number);
  const maxMin = ch * 60 + cm + 30;
  const [eh, em] = endTime.split(':').map(Number);
  const endMin = eh * 60 + em;
  // Handle midnight wrap: if end is next day (< start), treat as > maxMin
  const [sh, sm] = startTime.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const adjustedEndMin = endMin < startMin ? endMin + 1440 : endMin;
  return adjustedEndMin <= maxMin;
}

type Props = {
  visible: boolean;
  date: string | null;
  shift: Shift | null;
  employees: Employee[];
  closingTime: string;
  onSave: (employeeId: number, startTime: string, endTime: string) => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function ShiftDrawer({ visible, date, shift, employees, closingTime, onSave, onDelete, onClose }: Props) {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(8);

  useEffect(() => {
    if (visible) {
      if (shift) {
        setSelectedEmployee(shift.employee_id);
        setStartTime(shift.start_time);
        setDuration(deriveDuration(shift.start_time, shift.end_time));
      } else {
        setSelectedEmployee(employees[0]?.id ?? null);
        setStartTime('');
        setDuration(8);
      }
    }
  }, [visible, shift, employees]);

  const selectedEmployeeRole = employees.find(e => e.id === selectedEmployee)?.role ?? '';
  const nightShift = isNightShift(selectedEmployeeRole);

  // Auto-adjust duration to first valid one when start time or employee changes
  useEffect(() => {
    if (!startTime || nightShift) return;
    if (!isDurationValid(startTime, duration, closingTime, nightShift)) {
      const firstValid = DURATIONS.find(h => isDurationValid(startTime, h, closingTime, nightShift));
      if (firstValid !== undefined) setDuration(firstValid);
    }
  }, [startTime, selectedEmployee, closingTime]);

  const endTime = startTime ? calcEndTime(startTime, duration) : '';

  const handleSave = () => {
    if (!selectedEmployee || !startTime) return;
    onSave(selectedEmployee, startTime, endTime);
  };

  const formatDate = (d: string | null) => {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.drawer}>
        <View style={styles.handle} />
        <Text style={styles.title}>{shift ? 'Edit Shift' : `Add Shift — ${formatDate(date)}`}</Text>

        {employees.length === 0 ? (
          <Text style={styles.noStaff}>Add staff first using the Staff button.</Text>
        ) : (
          <>
            <Text style={styles.label}>Employee</Text>
            <FlatList
              horizontal
              data={employees}
              keyExtractor={e => String(e.id)}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const color = getRoleColor(item.role);
                const isSelected = selectedEmployee === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.chip, isSelected && { backgroundColor: color, borderColor: color }]}
                    onPress={() => setSelectedEmployee(item.id)}
                  >
                    <View style={[styles.chipDot, { backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : color }]} />
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              style={styles.chipList}
            />

            <Text style={styles.label}>Start Time</Text>
            <TimePicker value={startTime} onChange={setStartTime} placeholder="Select start time" />

            <Text style={[styles.label, { marginTop: 14 }]}>Shift Duration</Text>
            {!nightShift && startTime && (
              <Text style={styles.closingNote}>
                Closes {closingTime} · max end {(() => {
                  const [ch, cm] = closingTime.split(':').map(Number);
                  const max = ch * 60 + cm + 30;
                  return `${String(Math.floor(max / 60) % 24).padStart(2, '0')}:${String(max % 60).padStart(2, '0')}`;
                })()}
              </Text>
            )}
            <View style={styles.durationRow}>
              {DURATIONS.map(h => {
                const valid = isDurationValid(startTime, h, closingTime, nightShift);
                const active = duration === h;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.durationBtn,
                      active && styles.durationBtnActive,
                      !valid && styles.durationBtnDisabled,
                    ]}
                    onPress={() => valid && setDuration(h)}
                    activeOpacity={valid ? 0.7 : 1}
                  >
                    <Text style={[
                      styles.durationText,
                      active && styles.durationTextActive,
                      !valid && styles.durationTextDisabled,
                    ]}>
                      {h}h
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {startTime ? (
              <View style={styles.endTimeRow}>
                <Text style={styles.endTimeLabel}>Ends at</Text>
                <Text style={styles.endTimeValue}>{endTime}</Text>
              </View>
            ) : (
              <Text style={styles.endTimePlaceholder}>Select a start time to see end time</Text>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Shift</Text>
            </TouchableOpacity>

            {shift && (
              <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                <Text style={styles.deleteBtnText}>Delete Shift</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  drawer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#e0e0e0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 16, color: '#1d1d1f' },
  label: { fontSize: 13, color: '#6e6e73', marginBottom: 6 },
  noStaff: { color: '#6e6e73', textAlign: 'center', marginVertical: 20 },

  chipList: { marginBottom: 16 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0',
    marginRight: 8, backgroundColor: '#F2F2F7', gap: 6,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 14, color: '#1d1d1f' },
  chipTextSelected: { color: 'white', fontWeight: '600' },

  closingNote: { fontSize: 11, color: '#FF9500', marginBottom: 6 },

  durationRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  durationBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#e0e0e0',
    backgroundColor: '#F2F2F7', alignItems: 'center',
  },
  durationBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  durationBtnDisabled: { backgroundColor: '#F2F2F7', borderColor: '#e0e0e0', opacity: 0.35 },
  durationText: { fontSize: 14, fontWeight: '600', color: '#1d1d1f' },
  durationTextActive: { color: 'white' },
  durationTextDisabled: { color: '#C7C7CC' },

  endTimeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 16,
    backgroundColor: '#F2F2F7', borderRadius: 10, paddingVertical: 10,
  },
  endTimeLabel: { fontSize: 13, color: '#6e6e73' },
  endTimeValue: { fontSize: 16, fontWeight: '700', color: '#1d1d1f' },
  endTimePlaceholder: {
    fontSize: 13, color: '#C7C7CC', textAlign: 'center',
    marginBottom: 16, fontStyle: 'italic',
  },

  saveBtn: {
    backgroundColor: '#007AFF', borderRadius: 12,
    padding: 14, alignItems: 'center', marginBottom: 8,
  },
  saveBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
  deleteBtn: { padding: 14, alignItems: 'center' },
  deleteBtnText: { color: '#FF3B30', fontWeight: '500', fontSize: 16 },
});
