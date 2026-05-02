import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ShiftCard from './ShiftCard';
import type { Shift } from '../db/database';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = {
  date: string;
  shifts: Shift[];
  onAddShift: (date: string) => void;
  onEditShift: (shift: Shift) => void;
};

export default function DayColumn({ date, shifts, onAddShift, onEditShift }: Props) {
  const d = new Date(date + 'T00:00:00');
  const label = DAY_LABELS[d.getDay()];
  const dayNum = d.getDate();

  return (
    <View style={styles.column}>
      <View style={styles.header}>
        <View>
          <Text style={styles.dayLabel}>{label}</Text>
          <Text style={styles.dayNum}>{dayNum}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => onAddShift(date)} activeOpacity={0.7}>
          <Text style={styles.addButtonText}>+ Add Shift</Text>
        </TouchableOpacity>
      </View>
      {shifts.map(shift => (
        <ShiftCard
          key={shift.id}
          shift={shift}
          onPress={s => { onEditShift(s); }}
        />
      ))}
      {shifts.length === 0 && (
        <Text style={styles.empty}>No shifts scheduled</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayLabel: { fontWeight: '600', fontSize: 15, color: '#1d1d1f' },
  dayNum: { fontSize: 12, color: '#6e6e73', marginTop: 1 },
  addButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: { color: 'white', fontSize: 13, fontWeight: '600' },
  empty: { color: '#c7c7cc', fontSize: 13, textAlign: 'center', paddingVertical: 12 },
});
