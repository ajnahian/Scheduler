import { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { addEmployee, deleteEmployee, getEmployees, type Employee } from '../db/database';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function EmployeesModal({ visible, onClose }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'tech' | 'manager'>('tech');

  const reload = () => setEmployees(getEmployees());

  useEffect(() => {
    if (visible) reload();
  }, [visible]);

  const handleAdd = () => {
    if (!name.trim()) return;
    addEmployee(name.trim(), role);
    setName('');
    reload();
  };

  const handleDelete = (id: number) => {
    deleteEmployee(id);
    reload();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Manage Staff</Text>

        <FlatList
          data={employees}
          keyExtractor={e => String(e.id)}
          style={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No staff yet. Add someone below.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View>
                <Text style={styles.empName}>{item.name}</Text>
                <Text style={styles.empRole}>{item.role === 'manager' ? 'Manager' : 'Technician'}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <View style={styles.addRow}>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity
            style={[styles.roleBtn, role === 'tech' && styles.roleBtnActive]}
            onPress={() => setRole('tech')}
          >
            <Text style={[styles.roleBtnText, role === 'tech' && styles.roleBtnActiveText]}>Tech</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'manager' && styles.roleBtnActive]}
            onPress={() => setRole('manager')}
          >
            <Text style={[styles.roleBtnText, role === 'manager' && styles.roleBtnActiveText]}>Mgr</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
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
    maxHeight: '65%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#e0e0e0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 12, color: '#1d1d1f' },
  list: { maxHeight: 220 },
  empty: { color: '#6e6e73', textAlign: 'center', paddingVertical: 20 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e0e0e0',
  },
  empName: { fontSize: 15, fontWeight: '500', color: '#1d1d1f' },
  empRole: { fontSize: 12, color: '#6e6e73', marginTop: 2 },
  removeText: { color: '#ff3b30', fontSize: 14 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  nameInput: {
    flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, color: '#1d1d1f',
  },
  roleBtn: {
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0',
  },
  roleBtnActive: { backgroundColor: '#007aff', borderColor: '#007aff' },
  roleBtnText: { fontSize: 13, color: '#1d1d1f' },
  roleBtnActiveText: { color: 'white' },
  addBtn: { backgroundColor: '#34c759', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
});
