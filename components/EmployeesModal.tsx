import { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { addEmployee, deleteEmployee, getEmployees, type Employee } from '../db/database';

const TITLES = [
  'Tech Experience Manager',
  'Tech Asst Experience Mgr',
  'Tech Merchandising Manager',
  'Tech Advisor',
  'Tech Specialist',
  'TECH - Service Technician',
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function EmployeesModal({ visible, onClose }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState(TITLES[0]);
  const [roleOpen, setRoleOpen] = useState(false);

  const reload = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  useEffect(() => {
    if (visible) reload();
  }, [visible]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addEmployee(name.trim(), role);
    setName('');
    setRole(TITLES[0]);
    setRoleOpen(false);
    reload();
  };

  const handleDelete = async (id: number) => {
    await deleteEmployee(id);
    reload();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Manage Staff</Text>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {employees.length === 0 && (
            <Text style={styles.empty}>No staff yet. Add someone below.</Text>
          )}
          {employees.map(item => (
            <View key={item.id} style={styles.row}>
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
              <Text style={styles.roleSelectorText}>{role}</Text>
              <Text style={styles.chevron}>{roleOpen ? '▴' : '▾'}</Text>
            </TouchableOpacity>

            {roleOpen && (
              <View style={styles.roleList}>
                {TITLES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.roleOption, t === role && styles.roleOptionSelected]}
                    onPress={() => { setRole(t); setRoleOpen(false); }}
                  >
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
    maxHeight: '80%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#e0e0e0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 12, color: '#1d1d1f' },
  empty: { color: '#6e6e73', textAlign: 'center', paddingVertical: 20 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e0e0e0',
  },
  empInfo: { flex: 1, marginRight: 12 },
  empName: { fontSize: 15, fontWeight: '500', color: '#1d1d1f' },
  empRole: { fontSize: 12, color: '#6e6e73', marginTop: 2 },
  removeText: { color: '#ff3b30', fontSize: 14 },
  addSection: { marginTop: 16, gap: 10 },
  nameInput: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#1d1d1f',
  },
  roleSelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'white',
  },
  roleSelectorOpen: { borderColor: '#007aff' },
  roleSelectorText: { fontSize: 15, color: '#1d1d1f', flex: 1, marginRight: 8 },
  chevron: { fontSize: 10, color: '#6e6e73' },
  roleList: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, overflow: 'hidden',
  },
  roleOption: {
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0',
  },
  roleOptionSelected: { backgroundColor: '#f0f7ff' },
  roleOptionText: { fontSize: 14, color: '#1d1d1f' },
  roleOptionTextSelected: { color: '#007aff', fontWeight: '600' },
  addBtn: {
    backgroundColor: '#34c759', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  addBtnText: { color: 'white', fontWeight: '600', fontSize: 15 },
});
