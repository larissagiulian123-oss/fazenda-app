import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity,
         ScrollView, StyleSheet, Alert } from 'react-native';
import { getDb } from '../database/db';
import { theme } from '../components/theme';

export default function CadastroScreen({ route, navigation }) {
  const func = route.params?.funcionario;
  const [nome, setNome] = useState(func?.nome || '');
  const [apelido, setApelido] = useState(func?.apelido || '');
  const [funcao, setFuncao] = useState(func?.funcao || '');
  const [diaria, setDiaria] = useState(func?.valor_diaria?.toString() || '');
  const [pix, setPix] = useState(func?.chave_pix || '');
  const [tipoPix, setTipoPix] = useState(func?.tipo_chave_pix || 'Telefone');
  const [telefone, setTelefone] = useState(func?.telefone || '');
  const [obs, setObs] = useState(func?.observacao || '');

  async function salvar() {
    if (!nome.trim() || !diaria.trim()) {
      Alert.alert('Atenção', 'Nome e valor da diária são obrigatórios.');
      return;
    }
    const db = await getDb();
    if (func) {
      await db.runAsync(
        `UPDATE Funcionarios SET nome=?, apelido=?, funcao=?, valor_diaria=?,
         chave_pix=?, tipo_chave_pix=?, telefone=?, observacao=? WHERE id=?`,
        [nome, apelido, funcao, parseFloat(diaria), pix, tipoPix, telefone, obs, func.id]
      );
    } else {
      await db.runAsync(
        `INSERT INTO Funcionarios (nome, apelido, funcao, valor_diaria,
         chave_pix, tipo_chave_pix, telefone, observacao, ativo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [nome, apelido, funcao, parseFloat(diaria), pix, tipoPix, telefone, obs]
      );
    }
    navigation.goBack();
  }

  const campo = (label, value, setter, keyboard = 'default') => (
    <View style={styles.campo}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setter}
        keyboardType={keyboard}
        placeholder={label}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>{func ? 'Editar' : 'Novo'} Funcionário</Text>
      {campo('Nome *', nome, setNome)}
      {campo('Apelido', apelido, setApelido)}
      {campo('Função', funcao, setFuncao)}
      {campo('Valor da Diária (R$) *', diaria, setDiaria, 'numeric')}
      {campo('Chave Pix', pix, setPix)}
      {campo('Telefone', telefone, setTelefone, 'phone-pad')}
      {campo('Observação', obs, setObs)}

      <TouchableOpacity style={styles.salvarBtn} onPress={salvar}>
        <Text style={styles.salvarTexto}>💾 Salvar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: theme.colors.bg, padding: 16 },
  titulo:      { fontSize: theme.fontSize.title, fontWeight: 'bold',
                 color: theme.colors.text, marginBottom: 20 },
  campo:       { marginBottom: 14 },
  label:       { fontSize: 14, color: theme.colors.subtext, marginBottom: 4 },
  input:       { backgroundColor: '#fff', borderRadius: 10, padding: 14,
                 fontSize: theme.fontSize.normal, elevation: 2 },
  salvarBtn:   { backgroundColor: '#27ae60', borderRadius: 12, padding: 18,
                 alignItems: 'center', marginTop: 10, marginBottom: 40 },
  salvarTexto: { color: '#fff', fontSize: theme.fontSize.large, fontWeight: 'bold' },
});