import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';
import { theme } from '../components/theme';

export default function LancamentoScreen({ navigation }) {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [lancamentos, setLancamentos] = useState({});

  useFocusEffect(useCallback(() => { carregar(); }, [data]));

  async function carregar() {
    const db = await getDb();
    const funcs = await db.getAllAsync(
      `SELECT * FROM Funcionarios WHERE ativo = 1 ORDER BY nome`
    );
    const lancs = await db.getAllAsync(
      `SELECT * FROM Lancamentos WHERE data = ?`, [data]
    );
    const mapa = {};
    for (const l of lancs) mapa[l.funcionario_id] = l.situacao;
    setFuncionarios(funcs);
    setLancamentos(mapa);
  }

  function mudarData(dias) {
    const d = new Date(data + 'T12:00:00');
    d.setDate(d.getDate() + dias);
    setData(d.toISOString().split('T')[0]);
  }

  async function marcar(func, situacao) {
    const db = await getDb();
    let valorFinal = 0;
    if (situacao === 'P') valorFinal = func.valor_diaria;
    if (situacao === 'M') valorFinal = func.valor_diaria * 0.5;
    if (situacao === 'E') valorFinal = func.valor_diaria;
    if (situacao === 'F') valorFinal = 0;

    const existe = await db.getFirstAsync(
      `SELECT id FROM Lancamentos WHERE data = ? AND funcionario_id = ?`,
      [data, func.id]
    );
    if (existe) {
      await db.runAsync(
        `UPDATE Lancamentos SET situacao=?, valor_base=?, valor_final=? WHERE id=?`,
        [situacao, func.valor_diaria, valorFinal, existe.id]
      );
    } else {
      await db.runAsync(
        `INSERT INTO Lancamentos (data, funcionario_id, situacao, valor_base, valor_final)
         VALUES (?, ?, ?, ?, ?)`,
        [data, func.id, situacao, func.valor_diaria, valorFinal]
      );
    }
    setLancamentos(prev => ({ ...prev, [func.id]: situacao }));
  }

  const corBotao = (sit) => ({
    'P': theme.colors.presente,
    'F': theme.colors.falta,
    'M': theme.colors.meia,
    'E': theme.colors.extra,
  }[sit] || '#ccc');

  return (
    <View style={styles.container}>
      {/* Navegação por data */}
      <View style={styles.dataRow}>
        <TouchableOpacity style={styles.setaBtn} onPress={() => mudarData(-1)}>
          <Text style={styles.seta}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.dataTexto}>
          {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
            weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
          })}
        </Text>
        <TouchableOpacity style={styles.setaBtn} onPress={() => mudarData(1)}>
          <Text style={styles.seta}>▶</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={funcionarios}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.diaria}>R$ {item.valor_diaria.toFixed(2)}/dia</Text>
            </View>
            <View style={styles.botoes}>
              {['P','F','M','E'].map(sit => (
                <TouchableOpacity
                  key={sit}
                  style={[styles.btn,
                    { backgroundColor: lancamentos[item.id] === sit
                        ? corBotao(sit) : '#ddd' }]}
                  onPress={() => marcar(item, sit)}
                >
                  <Text style={[styles.btnTexto,
                    { color: lancamentos[item.id] === sit ? '#fff' : '#555' }]}>
                    {sit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  dataRow:   { flexDirection: 'row', alignItems: 'center',
               justifyContent: 'space-between', padding: 12,
               backgroundColor: '#fff', elevation: 3 },
  setaBtn:   { padding: 10 },
  seta:      { fontSize: 22, color: theme.colors.text },
  dataTexto: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text, flex: 1,
               textAlign: 'center', textTransform: 'capitalize' },
  card:      { backgroundColor: '#fff', margin: 8, borderRadius: 10,
               padding: 14, flexDirection: 'row', alignItems: 'center',
               elevation: 2, justifyContent: 'space-between' },
  cardInfo:  { flex: 1 },
  nome:      { fontSize: theme.fontSize.normal, fontWeight: 'bold',
               color: theme.colors.text },
  diaria:    { fontSize: 14, color: theme.colors.subtext },
  botoes:    { flexDirection: 'row', gap: 6 },
  btn:       { width: 44, height: 44, borderRadius: 8,
               alignItems: 'center', justifyContent: 'center' },
  btnTexto:  { fontSize: 16, fontWeight: 'bold' },
});