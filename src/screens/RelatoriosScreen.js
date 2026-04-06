import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity,
         StyleSheet, TextInput } from 'react-native';
import { getDb } from '../database/db';
import { theme } from '../components/theme';

export default function RelatoriosScreen() {
  const hoje = new Date();
  const [mes, setMes] = useState(
    `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`
  );
  const [dados, setDados] = useState([]);

  async function buscar() {
    const db = await getDb();
    const rows = await db.getAllAsync(`
      SELECT f.nome,
        SUM(CASE WHEN l.situacao IN ('P','E','M') THEN 1 ELSE 0 END) as presentes,
        SUM(CASE WHEN l.situacao = 'F' THEN 1 ELSE 0 END) as faltas,
        SUM(l.valor_final) as total
      FROM Funcionarios f
      JOIN Lancamentos l ON l.funcionario_id = f.id
      WHERE l.data LIKE ?
      GROUP BY f.id
      ORDER BY faltas DESC
    `, [`${mes}%`]);
    setDados(rows);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📊 Relatório Mensal</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={mes}
          onChangeText={setMes}
          placeholder="AAAA-MM"
        />
        <TouchableOpacity style={styles.buscarBtn} onPress={buscar}>
          <Text style={styles.buscarTexto}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dados}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.sub}>
                ✅ {item.presentes} presenças | ❌ {item.faltas} faltas
              </Text>
            </View>
            <Text style={styles.total}>R$ {(item.total || 0).toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 14 },
  titulo:    { fontSize: theme.fontSize.large, fontWeight: 'bold',
               color: theme.colors.text, marginBottom: 14 },
  row:       { flexDirection: 'row', alignItems: 'center',
               marginBottom: 14, gap: 8 },
  input:     { backgroundColor: '#fff', borderRadius: 8, padding: 12,
               fontSize: 16, elevation: 1 },
  buscarBtn: { backgroundColor: '#2980b9', borderRadius: 8,
               padding: 12, paddingHorizontal: 18 },
  buscarTexto:{ color: '#fff', fontSize: 16, fontWeight: 'bold' },
  card:      { backgroundColor: '#fff', borderRadius: 10, padding: 14,
               marginBottom: 8, flexDirection: 'row',
               alignItems: 'center', elevation: 2, gap: 10 },
  rank:      { fontSize: 20, fontWeight: 'bold', color: '#f39c12', width: 30 },
  nome:      { fontSize: theme.fontSize.normal, fontWeight: 'bold',
               color: theme.colors.text },
  sub:       { fontSize: 13, color: theme.colors.subtext },
  total:     { fontSize: 18, fontWeight: 'bold', color: '#27ae60' },
});