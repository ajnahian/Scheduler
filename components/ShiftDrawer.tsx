import { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import type { Employee, Shift } from '../db/database';
import TimePicker from './TimePicker';

type Props = {
  visible: boolean;
  date: string | null;
  shift: Shift | null;
  employees: Employee[];
  onSave: (employeeId: number, startTime: string, endTime: string) => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function ShiftDrawer({ visible, date, shift, employees, onSave, onDelete, onClose }: Props) {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (visible) {
      if (shift) {
        setSelectedEmployee(shift.employee_id);
        setStartTime(shift.start_time);
        setEndTime(shift.end_time);
      } else {
        setSelectedEmployee(employees[0]?.id ?? null);
        setStartTime('');
        setEndTime('');
      }
    }
  }, [visible, shift, employees]);

  const handleSave = () => {
    if (!selectedEmployee || !startTime || !endTime) return;
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.chip, selectedEmployee === item.id && styles.chipSelected]}
                  onPress={() => setSelectedEmployee(item.id)}
                >
                  <Text style={[styles.chipText, selectedEmployee === item.id && styles.chipTextSelected]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.chipList}
            />

            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.label}>Start</Text>
                <TimePicker value={startTime} onChange={setStartTime} placeholder="00:00" />
              </View>
              <View style={styles.timeField}>
                <Text style={styles.label}>End</Text>
                <TimePicker value={endTime} onChange={setEndTime} placeholder="00:00" />
              </View>
            </View>

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
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0',
    marginRight: 8, backgroundColor: '#f5f5f7',
  },
  chipSelected: { backgroundColor: '#007aff', borderColor: '#007aff' },
  chipText: { fontSize: 14, color: '#1d1d1f' },
  chipTextSelected: { color: 'white' },
  timeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  timeField: { flex: 1 },
  saveBtn: {
    backgroundColor: '#007aff', borderRadius: 12,
    padding: 14, alignItems: 'center', marginBottom: 8,
  },
  saveBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
  deleteBtn: { padding: 14, alignItems: 'center' },
  deleteBtnText: { color: '#ff3b30', fontWeight: '500', fontSize: 16 },
});
