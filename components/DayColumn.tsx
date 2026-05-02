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
    <TouchableOpacity style={styles.column} onPress={() => onAddShift(date)} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.dayLabel}>{label}</Text>
        <Text style={styles.dayNum}>{dayNum}</Text>
      </View>
      {shifts.map(shift => (
        <ShiftCard
          key={shift.id}
          shift={shift}
          onPress={s => { onEditShift(s); }}
        />
      ))}
      {shifts.length === 0 && (
        <Text style={styles.empty}>+</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  column: {
    width: 120,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    minHeight: 140,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: { marginBottom: 8 },
  dayLabel: { fontWeight: '600', fontSize: 13, color: '#1d1d1f' },
  dayNum: { fontSize: 11, color: '#6e6e73' },
  empty: { color: '#c7c7cc', fontSize: 20, textAlign: 'center', marginTop: 16 },
});
