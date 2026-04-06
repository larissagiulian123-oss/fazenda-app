import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity,
         TextInput, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';
import { theme } from '../components/theme';

export default function FuncionariosScreen({ navigation }) {
  const [lista, setLista] = useState([]);
  const [busca, setBusca] = useState('');

  useFocusEffect(useCallback(() => { carregar(); }, []));

  async function carregar() {
    const db = await getDb();
    const rows = await db.getAllAsync(
      `SELECT * FROM Funcionarios ORDER BY ativo DESC, nome`
    );
    setLista(rows);
  }

  async function excluir(id) {
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Cancelar' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const db = await getDb();
        await db.runAsync(`DELETE FROM Funcionarios WHERE id = ?`, [id]);
        carregar();
      }}
    ]);
  }

  async function toggleAtivo(item) {
    const db = await getDb();
    await db.runAsync(
      `UPDATE Funcionarios SET ativo = ? WHERE id = ?`,
      [item.ativo ? 0 : 1, item.id]
    );
    carregar();
  }

  const filtrado = lista.filter(f =>
    f.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.busca}
        placeholder="🔍 Buscar funcionário..."
        value={busca}
        onChangeText={setBusca}
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('Cadastro', { funcionario: null })}
      >
        <Text style={styles.addBtnTexto}>+ Novo Funcionário</Text>
      </TouchableOpacity>

      <FlatList
        data={filtrado}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.ativo && styles.cardInativo]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.sub}>{item.funcao} • R$ {item.valor_diaria.toFixed(2)}/dia</Text>
              {item.chave_pix ? (
                <Text style={styles.pix}>Pix: {item.chave_pix}</Text>
              ) : null}
            </View>
            <View style={styles.acoes}>
              <TouchableOpacity style={styles.acaoBtn}
                onPress={() => navigation.navigate('Cadastro', { funcionario: item })}>
                <Text style={{ fontSize: 18 }}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acaoBtn} onPress={() => toggleAtivo(item)}>
                <Text style={{ fontSize: 18 }}>{item.ativo ? '🔴' : '🟢'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acaoBtn} onPress={() => excluir(item.id)}>
                <Text style={{ fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: theme.colors.bg, padding: 12 },
  busca:       { backgroundColor: '#fff', borderRadius: 10, padding: 12,
                 fontSize: 16, marginBottom: 10, elevation: 2 },
  addBtn:      { backgroundColor: '#27ae60', borderRadius: 10, padding: 14,
                 alignItems: 'center', marginBottom: 12 },
  addBtnTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  card:        { backgroundColor: '#fff', borderRadius: 10, padding: 14,
                 marginBottom: 8, flexDirection: 'row',
                 alignItems: 'center', elevation: 2 },
  cardInativo: { opacity: 0.5 },
  nome:        { fontSize: theme.fontSize.normal, fontWeight: 'bold',
                 color: theme.colors.text },
  sub:         { fontSize: 14, color: theme.colors.subtext },
  pix:         { fontSize: 13, color: '#8e44ad', marginTop: 2 },
  acoes:       { flexDirection: 'row', gap: 6 },
  acaoBtn:     { padding: 6 },
});