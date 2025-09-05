// Importa os pacotes necessários
const express = require('express'); // Framework web para Node.js
const mysql = require('mysql2');     // Biblioteca para conectar com MySQL
const multer = require('multer');     // Biblioteca para lidar com upload de arquivos
const bodyParser = require('body-parser'); // Biblioteca para ler o corpo das requisições
const path = require('path');         // Módulo para lidar com caminhos de arquivos
const bcrypt = require('bcrypt');


// Inicializa o app Express e define a porta
const app = express();
const port = 3000;

// Middleware para interpretar dados enviados via formulário e JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define pastas públicas para acesso direto aos arquivos estáticos
app.use('/empresa', express.static(path.join(__dirname, 'tela_empresa')));
app.use('/principal', express.static(path.join(__dirname, 'tela_principal')));
app.use('/portfolio', express.static(path.join(__dirname, 'tela_testes')));
app.use('/login', express.static(path.join(__dirname, 'tela_login')));
app.use('/cadastro', express.static(path.join(__dirname, 'tela_cadastro')));
app.use('/admin', express.static(path.join(__dirname, 'tela_admin')));
app.use('/uploads', express.static('uploads')); // Permite acesso aos arquivos enviados

// Configuração do armazenamento com multer para upload dos arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Define o diretório onde os arquivos serão salvos
  },
  filename: function (req, file, cb) {
    // Cria um nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Nome do arquivo + extensão
  }
});
const upload = multer({ storage }); // Cria instância do multer com as configurações

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '223344',
  database: 'rh_reis'
});

// Estabelece a conexão e exibe mensagem no console
db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL.');
});

// Rota para cadastrar um novo candidato
app.post('/candidatos', upload.fields([
  { name: 'curriculo', maxCount: 1 },
  { name: 'rg_anexo', maxCount: 1 },
  { name: 'comprovante', maxCount: 1 }
]), (req, res) => {
  const body = req.body; // Dados enviados pelo formulário
  const files = req.files; // Arquivos enviados pelo formulário

  // Pega os caminhos dos arquivos ou define como null se não enviados
  const curriculoPath = files.curriculo?.[0]?.filename || null;
  const rgPath = files.rg_anexo?.[0]?.filename || null;
  const comprovantePath = files.comprovante?.[0]?.filename || null;

  // Comando SQL com placeholders (?) para prevenir SQL Injection
  const sql = `INSERT INTO candidatos (
      nome, data_nasci, genero, email, telefone, cpf,
      logradouro, numero, bairro, municipio, estado,
      complemento, curso, situacao_curso, data_conclusao,
      cargo_desejado, pretensao_salarial, disponibilidade,
      soft_skills, hard_skills, sobre_voce, curriculo,
      rg, comprovante_endereco, nota_portugues, nota_logica, nota_ingles
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  // Valores que serão inseridos na tabela, na mesma ordem do SQL
  const values = [
    body.nome,
    body.nascimento,
    body.genero,
    body.email,
    body.telefone,
    body.cpf,
    body.logradouro,
    body.numero,
    body.bairro,
    body.municipio,
    body.estado,
    body.complemento || null,
    body.formacao,
    body.situacao_formacao,
    body.conclusao || null,
    body.cargo,
    parseFloat(body.salario) || 0,
    body.disponibilidade,
    body.softSkills || null,
    body.hardSkills || null,
    body.sobre || null,
    curriculoPath,
    rgPath,
    comprovantePath,
    body.nota_portugues,
    body.nota_logica,
    body.nota_ingles
  ];

  // Executa o comando SQL no banco de dados
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir no banco:', err.sqlMessage);
      return res.status(500).send('Erro ao salvar no banco de dados.');
    }
    res.send('Candidato cadastrado com sucesso!');
  });
});

app.get('/candidatos/verificar', (req, res) => {
  const cpf = req.query.cpf;

  const sql = 'SELECT * FROM candidatos WHERE cpf = ?';
  db.query(sql, [cpf], (err, results) => {
    if (err) {
      console.error('Erro ao buscar candidato por CPF:', err);
      return res.status(500).json({ existe: false });
    }

    if (results.length > 0) {
      return res.json({ existe: true });
    } else {
      return res.json({ existe: false });
    }
  });
});

//Verificar se já fez o teste
app.get('/candidatos/ja-fez-teste', (req, res) => {
  const { cpf, grupo } = req.query;

  let colunaNota;
  if (grupo === 'portugues') colunaNota = 'nota_portugues';
  else if (grupo === 'logica') colunaNota = 'nota_logica';
  else if (grupo === 'ingles') colunaNota = 'nota_ingles';
  else return res.status(400).json({ sucesso: false, mensagem: 'Grupo inválido.' });

  const sql = `SELECT ${colunaNota} FROM candidatos WHERE cpf = ?`;
  db.query(sql, [cpf], (err, results) => {
    if (err) {
      console.error('Erro ao buscar nota:', err);
      return res.status(500).json({ sucesso: false });
    }

    if (results.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'CPF não encontrado.' });
    }

    const nota = results[0][colunaNota];
    res.json({ jaFez: nota !== null }); // true se já fez
  });
});



// Rota para retornar todos os candidatos do banco, ordenados por nome
app.get('/candidatos', (req, res) => {
  const sql = 'SELECT * FROM candidatos ORDER BY nome ASC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar candidatos:', err);
      return res.status(500).json({ error: 'Erro no banco de dados' });
    }
    res.json(results); // Retorna todos os candidatos em formato JSON
  });
});

//Rota para salvar as notas
app.post('/salvar-nota', (req, res) => {
  const { cpf, grupo, nota } = req.body;

  if (!cpf || !grupo || nota == null) {
    return res.status(400).json({ sucesso: false, mensagem: 'Dados incompletos.' });
  }

  let colunaNota;
  if (grupo === 'portugues') colunaNota = 'nota_portugues';
  else if (grupo === 'logica') colunaNota = 'nota_logica';
  else if (grupo === 'ingles') colunaNota = 'nota_ingles';
  else return res.status(400).json({ sucesso: false, mensagem: 'Grupo inválido.' });

  const sql = `UPDATE candidatos SET ${colunaNota} = ? WHERE cpf = ?`;
  db.query(sql, [nota, cpf], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar nota:', err);
      return res.status(500).json({ sucesso: false });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'CPF não encontrado.' });
    }

    res.json({ sucesso: true });
  });
});


// Rota para excluir um candidato com base no ID
app.delete('/candidatos/:id', (req, res) => {
  const id = req.params.id; // Obtém o ID passado na URL
  db.query('DELETE FROM candidatos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Erro ao excluir candidato:', err);
      return res.status(500).json({ error: 'Erro ao excluir' });
    }
    res.json({ message: 'Candidato excluído com sucesso' });
  });
});

app.post('/login-admin', (req, res) => {
  const { email, senha } = req.body;

  // Consulta o admin no banco pelo email
  const sql = 'SELECT * FROM cadastroadmin WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Erro ao buscar admin:', err);
      return res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor.' });
    }

    // Se não encontrar nenhum resultado
    if (results.length === 0) {
      return res.json({ sucesso: false });
    }

    const admin = results[0];

    bcrypt.compare(senha, admin.senha, (err, resultado) => {
  if (err) {
    console.error('Erro ao comparar senhas:', err);
    return res.status(500).json({ sucesso: false });
  }

  if (resultado) {
    // Senha correta
    return res.json({ sucesso: true });
  } else {
    // Senha incorreta
    return res.json({ sucesso: false });
  }
});

  });
});


// Inicia o servidor na porta especificada e exibe mensagem no console
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
