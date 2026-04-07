import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput,
         StyleSheet, Alert, ScrollView } from 'react-native';
import { getDb } from '../database/db';
import { theme } from '../components/theme';

export default function DetalheScreen({ route, navigation }) {
  const { lancamentoId, funcionarioNome } = route.params || {};
  const [lancamento, setLancamento] = useState(null);
  const [obs, setObs] = useState('');
  const [valorExtra, setValorExtra] = useState('');

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const db = await getDb();
    const row = await db.getFirstAsync(
      `SELECT * FROM Lancamentos WHERE id = ?`, [lancamentoId]
    );
    if (row) {
      setLancamento(row);
      setObs(row.observacao || '');
      setValorExtra(row.valor_extra?.toString() || '0');
    }
  }

  async function salvar() {
    const db = await getDb();
    const extra = parseFloat(valorExtra) || 0;
    const valorFinal = (lancamento.valor_base || 0) + extra;
    await db.runAsync(
      `UPDATE Lancamentos SET observacao=?, valor_extra=?, valor_final=? WHERE id=?`,
      [obs, extra, valorFinal, lancamentoId]
    );
    Alert.alert('Salvo!', 'Lançamento atualizado com sucesso.');
    navigation.goBack();
  }

  async function excluir() {
    Alert.alert('Excluir', 'Tem certeza que quer excluir esse lançamento?', [
      { text: 'Cancelar' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const db = await getDb();
        await db.runAsync(`DELETE FROM Lancamentos WHERE id = ?`, [lancamentoId]);
        navigation.goBack();
      }}
    ]);
  }

  const corSituacao = {
    'P': theme.colors.presente,
    'F': theme.colors.falta,
    'M': theme.colors.meia,
    'E': theme.colors.extra,
  };

  const nomeSituacao = {
    'P': 'Presente',
    'F': 'Falta',
    'M': 'Meia Diária',
    'E': 'Extra',
  };

  if (!lancamento) return (
    <View style={styles.container}>
      <Text>Carregando...</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>{funcionarioNome}</Text>

      <View style={[styles.badge,
        { backgroundColor: corSituacao[lancamento.situacao] }]}>
        <Text style={styles.badgeTexto}>
          {nomeSituacao[lancamento.situacao]}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Valor Base</Text>
        <Text style={styles.valor}>R$ {lancamento.valor_base?.toFixed(2)}</Text>
      </View>

      {lancamento.situacao === 'E' && (
        <View style={styles.card}>
          <Text style={styles.label}>Valor Extra (R$)</Text>
          <TextInput
            style={styles.input}
            value={valorExtra}
            onChangeText={setValorExtra}
            keyboardType="numeric"
            placeholder="0.00"
          />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Valor Final</Text>
        <Text style={[styles.valor, { color: '#27ae60' }]}>
          R$ {lancamento.valor_final?.toFixed(2)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Observação</Text>
        <TextInput
          style={styles.input}
          value={obs}
          onChangeText={setObs}
          placeholder="Alguma observação sobre o dia..."
          multiline
        />
      </View>

      <TouchableOpacity style={styles.salvarBtn} onPress={salvar}>
        <Text style={styles.salvarTexto}>💾 Salvar Alterações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.excluirBtn} onPress={excluir}>
        <Text style={styles.excluirTexto}>🗑️ Excluir Lançamento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: theme.colors.bg, padding: 16 },
  titulo:      { fontSize: theme.fontSize.title, fontWeight: 'bold',
                 color: theme.colors.text, marginBottom: 16 },
  badge:       { borderRadius: 10, padding: 14, alignItems: 'center',
                 marginBottom: 16 },
  badgeTexto:  { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card:        { backgroundColor: '#fff', borderRadius: 10, padding: 14,
                 marginBottom: 12, elevation: 2 },
  label:       { fontSize: 14, color: theme.colors.subtext, marginBottom: 6 },
  valor:       { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  input:       { fontSize: 16, color: theme.colors.text, borderBottomWidth: 1,
                 borderBottomColor: '#ddd', paddingVertical: 6 },
  salvarBtn:   { backgroundColor: '#27ae60', borderRadius: 12, padding: 18,
                 alignItems: 'center', marginBottom: 12 },
  salvarTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  excluirBtn:  { backgroundColor: '#e74c3c', borderRadius: 12, padding: 18,
                 alignItems: 'center', marginBottom: 40 },
  excluirTexto:{ color: '#fff', fontSize: 18, fontWeight: 'bold' },
});