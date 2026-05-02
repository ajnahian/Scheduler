import { ScrollView, StyleSheet } from 'react-native';
import DayColumn from './DayColumn';
import type { Shift } from '../db/database';

type Props = {
  dates: string[];
  shifts: Shift[];
  onAddShift: (date: string) => void;
  onEditShift: (shift: Shift) => void;
};

export default function WeekView({ dates, shifts, onAddShift, onEditShift }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {dates.map(date => (
        <DayColumn
          key={date}
          date={date}
          shifts={shifts.filter(s => s.date === date)}
          onAddShift={onAddShift}
          onEditShift={onEditShift}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 12, flexDirection: 'row' },
});
