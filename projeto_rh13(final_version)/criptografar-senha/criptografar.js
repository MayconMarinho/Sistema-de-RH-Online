const bcrypt = require('bcrypt'); // importa o bcrypt

const senhaOriginal = '123456'; // aqui você coloca a senha que deseja
const saltRounds = 10; // nível de segurança

bcrypt.hash(senhaOriginal, saltRounds, function(err, hash) {
  if (err) {
    console.log('Erro ao criptografar:', err);
    return;
  }

  console.log('Senha criptografada:');
  console.log(hash); // isso aqui é o que você vai copiar e colar no banco
});

// npm init -y
// npm install bcrypt

// cd criptografar-senha
// node criptografar.js
