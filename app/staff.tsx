import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  addEmployee, deleteEmployee, getEmployees,
  getClosingTimes, setClosingTimes,
  type Employee, type ClosingTimes,
} from '../db/database';
import { STAFF_TITLES, getRoleColor } from '../constants/roles';
import TimePicker from '../components/TimePicker';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_TIMES: ClosingTimes = {
  0: '21:00', 1: '21:00', 2: '21:00', 3: '21:00',
  4: '21:00', 5: '21:00', 6: '21:00',
};

export default function StaffScreen() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState<string>(STAFF_TITLES[0]);
  const [roleOpen, setRoleOpen] = useState(false);
  const [closingTimes, setClosingTimesState] = useState<ClosingTimes>({ ...DEFAULT_TIMES });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const reload = async () => {
    const [data, ct] = await Promise.all([getEmployees(), getClosingTimes()]);
    setEmployees(data);
    setClosingTimesState(ct);
  };

  useEffect(() => { reload(); }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addEmployee(name.trim(), role);
    setName('');
    setRole(STAFF_TITLES[0]);
    setRoleOpen(false);
    await reload();
  };

  const handleDelete = async (id: number) => {
    await deleteEmployee(id);
    await reload();
  };

  const updateDay = (dayIdx: number, time: string) => {
    setClosingTimesState(prev => ({ ...prev, [dayIdx]: time }));
  };

  const handleSaveClosingTimes = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      await setClosingTimes(closingTimes);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const canViewSchedule = employees.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Staff Setup</Text>
        {canViewSchedule && (
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Closing times per day ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Closing Times by Day</Text>
            <Text style={styles.cardHint}>
              Non-night-shift staff cannot end more than 30 min after the day's closing time.
            </Text>

            {DAYS_OF_WEEK.map((day, idx) => (
              <View key={idx} style={styles.dayRow}>
                <Text style={styles.dayLabel}>{day}</Text>
                <View style={styles.dayPickerWrap}>
                  <TimePicker
                    value={closingTimes[idx] ?? '21:00'}
                    onChange={t => updateDay(idx, t)}
                    placeholder="Set time"
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[
                styles.saveTimesBtn,
                saving && styles.btnDisabled,
                saveStatus === 'saved' && styles.btnSaved,
                saveStatus === 'error' && styles.btnError,
              ]}
              onPress={handleSaveClosingTimes}
              disabled={saving}
            >
              <Text style={styles.saveTimesBtnText}>
                {saving ? 'Saving…' : saveStatus === 'saved' ? 'Saved ✓' : saveStatus === 'error' ? 'Failed — try again' : 'Save Closing Times'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Current staff ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Staff Members</Text>
            {employees.length === 0 ? (
              <Text style={styles.emptyMsg}>No staff added yet — use the form below.</Text>
            ) : (
              employees.map((emp, i) => (
                <View
                  key={emp.id}
                  style={[styles.empRow, i < employees.length - 1 && styles.empRowBorder]}
                >
                  <View style={[styles.empRoleBar, { backgroundColor: getRoleColor(emp.role) }]} />
                  <View style={styles.empInfo}>
                    <Text style={styles.empName}>{emp.name}</Text>
                    <Text style={styles.empRole}>{emp.role}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(emp.id)} hitSlop={8}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* ── Add staff form ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add Staff Member</Text>

            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor="#aaa"
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />

            <TouchableOpacity
              style={[styles.roleSelector, roleOpen && styles.roleSelectorOpen]}
              onPress={() => setRoleOpen(o => !o)}
              activeOpacity={0.7}
            >
              <View style={[styles.dot, { backgroundColor: getRoleColor(role) }]} />
              <Text style={styles.roleSelectorText}>{role}</Text>
              <Text style={styles.chevron}>{roleOpen ? '▴' : '▾'}</Text>
            </TouchableOpacity>

            {roleOpen && (
              <View style={styles.roleList}>
                {STAFF_TITLES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.roleOption, t === role && styles.roleOptionSelected]}
                    onPress={() => { setRole(t); setRoleOpen(false); }}
                  >
                    <View style={[styles.dot, { backgroundColor: getRoleColor(t) }]} />
                    <Text style={[styles.roleOptionText, t === role && styles.roleOptionTextSelected]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.addBtn, !name.trim() && styles.btnDisabled]}
              onPress={handleAdd}
              disabled={!name.trim()}
            >
              <Text style={styles.addBtnText}>Add Staff Member</Text>
            </TouchableOpacity>
          </View>

          {canViewSchedule && (
            <TouchableOpacity style={styles.viewScheduleBtn} onPress={() => router.back()}>
              <Text style={styles.viewScheduleBtnText}>View Schedule →</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1d1d1f' },
  doneBtn: {
    backgroundColor: '#007AFF', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  doneBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 48 },

  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1d1d1f' },
  cardHint: { fontSize: 12, color: '#6e6e73', marginTop: -4 },

  // Per-day closing time rows
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayLabel: {
    width: 90,
    fontSize: 14,
    fontWeight: '500',
    color: '#1d1d1f',
    flexShrink: 0,
  },
  dayPickerWrap: { flex: 1 },

  saveTimesBtn: {
    backgroundColor: '#007AFF', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', marginTop: 4,
  },
  saveTimesBtnText: { color: 'white', fontWeight: '600', fontSize: 15 },
  btnDisabled: { opacity: 0.45 },
  btnSaved: { backgroundColor: '#34C759' },
  btnError: { backgroundColor: '#FF3B30' },

  // Staff list
  emptyMsg: { fontSize: 13, color: '#6e6e73', textAlign: 'center', paddingVertical: 8 },
  empRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  empRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  empRoleBar: { width: 4, height: 38, borderRadius: 2, flexShrink: 0 },
  empInfo: { flex: 1 },
  empName: { fontSize: 15, fontWeight: '500', color: '#1d1d1f' },
  empRole: { fontSize: 12, color: '#6e6e73', marginTop: 2 },
  removeText: { color: '#FF3B30', fontSize: 14, fontWeight: '500' },

  // Add form
  nameInput: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 15, color: '#1d1d1f',
  },
  roleSelector: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    backgroundColor: 'white', gap: 8,
  },
  roleSelectorOpen: { borderColor: '#007AFF' },
  dot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  roleSelectorText: { fontSize: 15, color: '#1d1d1f', flex: 1 },
  chevron: { fontSize: 10, color: '#6e6e73' },
  roleList: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, overflow: 'hidden',
  },
  roleOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0',
  },
  roleOptionSelected: { backgroundColor: '#F2F2F7' },
  roleOptionText: { fontSize: 14, color: '#1d1d1f' },
  roleOptionTextSelected: { fontWeight: '600' },
  addBtn: {
    backgroundColor: '#34C759', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  addBtnText: { color: 'white', fontWeight: '600', fontSize: 15 },

  viewScheduleBtn: {
    backgroundColor: '#007AFF', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  viewScheduleBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
