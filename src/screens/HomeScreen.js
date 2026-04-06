import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';
import { theme } from '../components/theme';

export default function HomeScreen({ navigation }) {
  const [resumo, setResumo] = useState({ presentes: 0, faltas: 0, total: 0 });

  useFocusEffect(
    React.useCallback(() => {
      carregarResumo();
    }, [])
  );

  async function carregarResumo() {
    const db = await getDb();
    const hoje = new Date().toISOString().split('T')[0];
    const rows = await db.getAllAsync(
      `SELECT situacao, valor_final FROM Lancamentos WHERE data = ?`, [hoje]
    );
    let presentes = 0, faltas = 0, total = 0;
    for (const r of rows) {
      if (r.situacao === 'P' || r.situacao === 'E' || r.situacao === 'M') presentes++;
      if (r.situacao === 'F') faltas++;
      total += r.valor_final || 0;
    }
    setResumo({ presentes, faltas, total });
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>🌾 Fazenda Boa Esperança</Text>
      <Text style={styles.subtitulo}>Hoje: {new Date().toLocaleDateString('pt-BR')}</Text>

      <View style={styles.resumoBox}>
        <Text style={styles.resumoTitulo}>Resumo do Dia</Text>
        <View style={styles.resumoRow}>
          <View style={[styles.badge, { backgroundColor: theme.colors.presente }]}>
            <Text style={styles.badgeNum}>{resumo.presentes}</Text>
            <Text style={styles.badgeLabel}>Presentes</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.colors.falta }]}>
            <Text style={styles.badgeNum}>{resumo.faltas}</Text>
            <Text style={styles.badgeLabel}>Faltas</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.colors.extra }]}>
            <Text style={styles.badgeNum}>R$ {resumo.total.toFixed(2)}</Text>
            <Text style={styles.badgeLabel}>Total</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('Lançamento')}>
        <Text style={styles.botaoTexto}>📋 Lançar Presença de Hoje</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.botao, { backgroundColor: '#8e44ad' }]}
        onPress={() => navigation.navigate('Fechamento')}>
        <Text style={styles.botaoTexto}>💰 Fazer Fechamento</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.botao, { backgroundColor: '#16a085' }]}
        onPress={() => navigation.navigate('Relatórios')}>
        <Text style={styles.botaoTexto}>📊 Ver Relatórios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: theme.colors.bg, padding: 16 },
  titulo:       { fontSize: theme.fontSize.title, fontWeight: 'bold',
                  color: theme.colors.text, marginTop: 20, textAlign: 'center' },
  subtitulo:    { fontSize: theme.fontSize.normal, color: theme.colors.subtext,
                  textAlign: 'center', marginBottom: 20 },
  resumoBox:    { backgroundColor: theme.colors.card, borderRadius: 12,
                  padding: 16, marginBottom: 20, elevation: 3 },
  resumoTitulo: { fontSize: theme.fontSize.large, fontWeight: 'bold',
                  color: theme.colors.text, marginBottom: 12 },
  resumoRow:    { flexDirection: 'row', justifyContent: 'space-around' },
  badge:        { borderRadius: 10, padding: 12, alignItems: 'center', minWidth: 90 },
  badgeNum:     { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  badgeLabel:   { fontSize: 12, color: '#fff', marginTop: 4 },
  botao:        { backgroundColor: '#27ae60', borderRadius: 12, padding: 18,
                  marginBottom: 12, alignItems: 'center', elevation: 2 },
  botaoTexto:   { fontSize: theme.fontSize.large, color: '#fff', fontWeight: 'bold' },
});