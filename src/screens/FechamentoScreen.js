import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList,
         StyleSheet, Share, TextInput } from 'react-native';
import { getDb } from '../database/db';
import { theme } from '../components/theme';

export default function FechamentoScreen() {
  const hoje = new Date().toISOString().split('T')[0];
  const [inicio, setInicio] = useState(hoje.slice(0, 8) + '01');
  const [fim, setFim] = useState(hoje);
  const [resultado, setResultado] = useState([]);

  async function calcular() {
    const db = await getDb();
    const rows = await db.getAllAsync(`
      SELECT f.nome, f.chave_pix,
             SUM(CASE WHEN l.situacao IN ('P','E') THEN 1 ELSE 0 END) as dias,
             SUM(CASE WHEN l.situacao = 'F' THEN 1 ELSE 0 END) as faltas,
             SUM(CASE WHEN l.situacao = 'M' THEN 1 ELSE 0 END) as meias,
             SUM(CASE WHEN l.situacao = 'E' THEN 1 ELSE 0 END) as extras,
             SUM(l.valor_final) as total
      FROM Funcionarios f
      JOIN Lancamentos l ON l.funcionario_id = f.id
      WHERE l.data BETWEEN ? AND ?
      GROUP BY f.id
      ORDER BY total DESC
    `, [inicio, fim]);
    setResultado(rows);
  }

  async function compartilhar() {
    const linhas = resultado.map(r =>
      `👷 ${r.nome}\n` +
      `   Dias: ${r.dias} | Faltas: ${r.faltas} | Meias: ${r.meias}\n` +
      `   Total: R$ ${(r.total || 0).toFixed(2)}` +
      (r.chave_pix ? `\n   Pix: ${r.chave_pix}` : '')
    ).join('\n\n');
    const texto = `🌾 FAZENDA BOA ESPERANÇA\n` +
      `Período: ${inicio} a ${fim}\n\n${linhas}`;
    await Share.share({ message: texto });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>💰 Fechamento por Período</Text>

      <View style={styles.filtros}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Data Início</Text>
          <TextInput style={styles.input} value={inicio} onChangeText={setInicio} />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.label}>Data Fim</Text>
          <TextInput style={styles.input} value={fim} onChangeText={setFim} />
        </View>
      </View>

      <TouchableOpacity style={styles.calcBtn} onPress={calcular}>
        <Text style={styles.calcTexto}>🔍 Calcular</Text>
      </TouchableOpacity>

      <FlatList
        data={resultado}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.detalhe}>
              ✅ {item.dias} dias | ❌ {item.faltas} faltas | 🔶 {item.meias} meias
            </Text>
            {item.chave_pix ? (
              <Text style={styles.pix}>Pix: {item.chave_pix}</Text>
            ) : null}
            <Text style={styles.total}>R$ {(item.total || 0).toFixed(2)}</Text>
          </View>
        )}
      />

      {resultado.length > 0 && (
        <TouchableOpacity style={styles.shareBtn} onPress={compartilhar}>
          <Text style={styles.shareTexto}>📤 Compartilhar via WhatsApp</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 14 },
  titulo:    { fontSize: theme.fontSize.large, fontWeight: 'bold',
               color: theme.colors.text, marginBottom: 16 },
  filtros:   { flexDirection: 'row', marginBottom: 10 },
  label:     { fontSize: 13, color: theme.colors.subtext, marginBottom: 4 },
  input:     { backgroundColor: '#fff', borderRadius: 8, padding: 10,
               fontSize: 15, elevation: 1 },
  calcBtn:   { backgroundColor: '#2980b9', borderRadius: 10, padding: 14,
               alignItems: 'center', marginBottom: 14 },
  calcTexto: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  card:      { backgroundColor: '#fff', borderRadius: 10, padding: 14,
               marginBottom: 8, elevation: 2 },
  nome:      { fontSize: theme.fontSize.normal, fontWeight: 'bold',
               color: theme.colors.text },
  detalhe:   { fontSize: 14, color: theme.colors.subtext, marginTop: 4 },
  pix:       { fontSize: 13, color: '#8e44ad', marginTop: 2 },
  total:     { fontSize: 22, fontWeight: 'bold', color: '#27ae60', marginTop: 6 },
  shareBtn:  { backgroundColor: '#25D366', borderRadius: 10, padding: 16,
               alignItems: 'center', marginTop: 10 },
  shareTexto:{ color: '#fff', fontSize: 16, fontWeight: 'bold' },
});