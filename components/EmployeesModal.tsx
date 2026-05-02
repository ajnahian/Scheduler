import { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { addEmployee, deleteEmployee, getEmployees, getClosingTime, setClosingTime, type Employee } from '../db/database';
import { STAFF_TITLES, getRoleColor } from '../constants/roles';
import TimePicker from './TimePicker';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function EmployeesModal({ visible, onClose }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState<string>(STAFF_TITLES[0]);
  const [roleOpen, setRoleOpen] = useState(false);
  const [closingTime, setClosingTimeState] = useState('21:00');
  const [savingTime, setSavingTime] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  const reload = async () => {
    const [data, ct] = await Promise.all([getEmployees(), getClosingTime()]);
    setEmployees(data);
    setClosingTimeState(ct);
  };

  useEffect(() => {
    if (visible) reload();
  }, [visible]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addEmployee(name.trim(), role);
    setName('');
    setRole(STAFF_TITLES[0]);
    setRoleOpen(false);
    reload();
  };

  const handleDelete = async (id: number) => {
    await deleteEmployee(id);
    reload();
  };

  const handleSaveClosingTime = async () => {
    setSavingTime(true);
    setSaveStatus('idle');
    setSaveError('');
    try {
      await setClosingTime(closingTime);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e: any) {
      setSaveStatus('error');
      setSaveError(e?.message ?? 'Unknown error');
    } finally {
      setSavingTime(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Manage Staff</Text>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Closing time section */}
          <View style={styles.closingSection}>
            <Text style={styles.sectionLabel}>Department Closing Time</Text>
            <Text style={styles.closingHint}>Non-night-shift staff can't end later than 30 min after this.</Text>
            <View style={styles.closingRow}>
              <View style={styles.closingPicker}>
                <TimePicker value={closingTime} onChange={setClosingTimeState} placeholder="Set closing time" />
              </View>
              <TouchableOpacity
                style={[
                  styles.saveTimeBtn,
                  savingTime && styles.saveTimeBtnDisabled,
                  saveStatus === 'saved' && styles.saveTimeBtnSaved,
                  saveStatus === 'error' && styles.saveTimeBtnError,
                ]}
                onPress={handleSaveClosingTime}
                disabled={savingTime}
              >
                <Text style={styles.saveTimeBtnText}>
                  {savingTime ? 'Saving…' : saveStatus === 'saved' ? 'Saved ✓' : saveStatus === 'error' ? 'Failed' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
            {saveStatus === 'error' && saveError ? (
              <Text style={styles.saveErrorText}>{saveError}</Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          {employees.length === 0 && (
            <Text style={styles.empty}>No staff yet. Add someone below.</Text>
          )}
          {employees.map(item => (
            <View key={item.id} style={styles.row}>
              <View style={[styles.roleIndicator, { backgroundColor: getRoleColor(item.role) }]} />
              <View style={styles.empInfo}>
                <Text style={styles.empName}>{item.name}</Text>
                <Text style={styles.empRole}>{item.role}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addSection}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Employee name"
              placeholderTextColor="#aaa"
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

            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addBtnText}>Add Staff Member</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#e0e0e0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 12, color: '#1d1d1f' },
  empty: { color: '#6e6e73', textAlign: 'center', paddingVertical: 20 },

  closingSection: { marginBottom: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#1d1d1f', marginBottom: 4 },
  closingHint: { fontSize: 11, color: '#6e6e73', marginBottom: 10 },
  closingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  closingPicker: { flex: 1 },
  saveTimeBtn: {
    backgroundColor: '#007AFF', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10, marginTop: 0, justifyContent: 'center',
  },
  saveTimeBtnDisabled: { opacity: 0.5 },
  saveTimeBtnSaved: { backgroundColor: '#34C759' },
  saveTimeBtnError: { backgroundColor: '#FF3B30' },
  saveTimeBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  saveErrorText: { fontSize: 11, color: '#FF3B30', marginTop: 6 },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e0e0e0', marginVertical: 12 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e0e0e0',
    gap: 10,
  },
  roleIndicator: { width: 4, height: 36, borderRadius: 2 },
  empInfo: { flex: 1 },
  empName: { fontSize: 15, fontWeight: '500', color: '#1d1d1f' },
  empRole: { fontSize: 12, color: '#6e6e73', marginTop: 2 },
  removeText: { color: '#FF3B30', fontSize: 14 },
  addSection: { marginTop: 16, gap: 10 },
  nameInput: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#1d1d1f',
  },
  roleSelector: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'white', gap: 8,
  },
  roleSelectorOpen: { borderColor: '#007AFF' },
  dot: { width: 10, height: 10, borderRadius: 5 },
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
    paddingVertical: 12, alignItems: 'center',
  },
  addBtnText: { color: 'white', fontWeight: '600', fontSize: 15 },
});
