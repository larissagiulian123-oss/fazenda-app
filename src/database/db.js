import * as SQLite from 'expo-sqlite';

let db;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('fazenda.db');
  }
  return db;
}

export async function initDb() {
  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Funcionarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      apelido TEXT,
      funcao TEXT,
      valor_diaria REAL NOT NULL,
      chave_pix TEXT,
      tipo_chave_pix TEXT,
      telefone TEXT,
      observacao TEXT,
      ativo INTEGER DEFAULT 1,
      criado_em TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Lancamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      funcionario_id INTEGER NOT NULL,
      situacao TEXT NOT NULL,
      valor_base REAL,
      valor_extra REAL DEFAULT 0,
      valor_final REAL,
      observacao TEXT,
      criado_em TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (funcionario_id) REFERENCES Funcionarios(id)
    );

    CREATE TABLE IF NOT EXISTS Fechamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_inicio TEXT,
      data_fim TEXT,
      funcionario_id INTEGER,
      dias_trabalhados INTEGER DEFAULT 0,
      faltas INTEGER DEFAULT 0,
      meias_diarias INTEGER DEFAULT 0,
      extras INTEGER DEFAULT 0,
      total_pagar REAL DEFAULT 0,
      pago INTEGER DEFAULT 0,
      data_pagamento TEXT,
      FOREIGN KEY (funcionario_id) REFERENCES Funcionarios(id)
    );
  `);

  // Inserir funcionários da fazenda (apenas se a tabela estiver vazia)
  const result = await db.getFirstAsync('SELECT COUNT(*) as total FROM Funcionarios');
  if (result.total === 0) {
    const funcionarios = [
      { nome: 'Solange Ferraz',       funcao: 'Trabalhadora Rural', diaria: 120 },
      { nome: 'Edilaine Jeker',       funcao: 'Trabalhadora Rural', diaria: 120 },
      { nome: 'Katia Salve',          funcao: 'Trabalhadora Rural', diaria: 120 },
      { nome: 'Aracely Lago',         funcao: 'Trabalhadora Rural', diaria: 120 },
      { nome: 'Nilson',               funcao: 'Peão de Campo',      diaria: 150 },
      { nome: 'Maykon',               funcao: 'Peão de Campo',      diaria: 150 },
      { nome: 'Vanderson Almeida',    funcao: 'Peão de Campo',      diaria: 150 },
      { nome: 'Josino Zeca',          funcao: 'Peão de Campo',      diaria: 150 },
      { nome: 'Alvan Soares',         funcao: 'Peão de Campo',      diaria: 150,
        chave_pix: '99 9986 7464',    tipo_chave_pix: 'Telefone' },
      { nome: 'Antônio Salim',        funcao: 'Peão de Campo',      diaria: 150,
        chave_pix: '9 21906 66 3574', tipo_chave_pix: 'Telefone' },
      { nome: 'Valdira Jorge',        funcao: 'Trabalhadora Rural', diaria: 120,
        chave_pix: '11040 6 54 10',   tipo_chave_pix: 'Telefone' },
      { nome: 'Rosana',               funcao: 'Trabalhadora Rural', diaria: 120 },
    ];

    for (const f of funcionarios) {
      await db.runAsync(
        `INSERT INTO Funcionarios (nome, funcao, valor_diaria, chave_pix, tipo_chave_pix, ativo)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [f.nome, f.funcao, f.diaria, f.chave_pix || null, f.tipo_chave_pix || null]
      );
    }
  }
}