import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { Shift } from '../db/database';
import { getRoleColor } from '../constants/roles';

type Props = {
  shift: Shift;
  onPress: (shift: Shift) => void;
};

export default function ShiftCard({ shift, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: getRoleColor(shift.role) }]}
      onPress={() => onPress(shift)}
    >
      <Text style={styles.name}>{shift.employee_name}</Text>
      <Text style={styles.time}>{shift.start_time}–{shift.end_time}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 8, padding: 6, marginBottom: 4 },
  name: { color: 'white', fontSize: 11, fontWeight: '600' },
  time: { color: 'rgba(255,255,255,0.85)', fontSize: 10 },
});
