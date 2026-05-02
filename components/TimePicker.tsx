import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const TIMES: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIMES.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

type Props = {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
};

export default function TimePicker({ value, onChange, placeholder = 'Select' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[styles.trigger, open && styles.triggerOpen]}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.7}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      {open && (
        <ScrollView
          style={styles.list}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {TIMES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.option, t === value && styles.optionSelected]}
              onPress={() => { onChange(t); setOpen(false); }}
            >
              <Text style={[styles.optionText, t === value && styles.optionTextSelected]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  triggerOpen: { borderColor: '#007aff' },
  value: { fontSize: 16, color: '#1d1d1f' },
  placeholder: { color: '#aaa' },
  chevron: { fontSize: 10, color: '#6e6e73' },
  list: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: 'white',
  },
  option: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  optionSelected: { backgroundColor: '#f0f7ff' },
  optionText: { fontSize: 15, color: '#1d1d1f', textAlign: 'center' },
  optionTextSelected: { color: '#007aff', fontWeight: '600' },
});
