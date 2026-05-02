import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import DayColumn from './DayColumn';
import type { Shift } from '../db/database';

type Props = {
  dates: string[];
  shifts: Shift[];
  onAddShift: (date: string) => void;
  onEditShift: (shift: Shift) => void;
};

export default function WeekView({ dates, shifts, onAddShift, onEditShift }: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <ScrollView
      horizontal={isWide}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={isWide ? styles.contentWide : styles.content}
    >
      {dates.map(date => (
        <DayColumn
          key={date}
          date={date}
          shifts={shifts.filter(s => s.date === date)}
          onAddShift={onAddShift}
          onEditShift={onEditShift}
          isWide={isWide}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 12, gap: 10 },
  contentWide: { flexDirection: 'row', padding: 16, gap: 12 },
});
