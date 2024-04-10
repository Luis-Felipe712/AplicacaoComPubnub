const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid'); // Importe a função uuidv4 para gerar UUIDs

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Função para gerar um UUID único
const generateUUID = () => {
  return uuidv4(); // Use uuidv4 para gerar um UUID único
};

// Configuração do PubNub com UUID
const pubnub = {
  publishKey: 'pub-c-7db2ed67-2e2d-4003-b0ed-8b97ed193d80',
  subscribeKey: 'sub-c-78a20e13-420c-4993-bc9c-db302c2b2d4f',
  uuid: generateUUID() // Use um UUID único
};

// Rota para servir a página HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// WebSocket com Socket.IO para comunicação em tempo real
io.on('connection', (socket) => {
  console.log('Novo usuário conectado');

  // Escuta por mensagens do cliente
  socket.on('chat message', (msg) => {
    console.log(`Mensagem recebida do cliente: ${msg}`);

    // Envia a mensagem para o canal 'messages' no PubNub
    pubnub.publish({ channel: 'messages', message: msg }, (status, response) => {
      if (!status.error) {
        console.log(`Mensagem enviada para o PubNub: ${msg}`);
      } else {
        console.error('Erro ao enviar mensagem para o PubNub:', status.errorData);
      }
    });
  });

  // Assina o canal 'messages' do PubNub para receber mensagens
  // (Neste exemplo simplificado, estamos simulando o recebimento de mensagens do PubNub)
  pubnub.subscribe = (channels) => {
    console.log(`Assinando o canal '${channels[0]}' do PubNub`);
  };

  // Emitir mensagens recebidas para todos os clientes conectados via WebSocket
  io.emit('chat message', 'Olá! Bem-vindo ao chat em tempo real.');

  // PubNub publish simulado para fins de demonstração
  setTimeout(() => {
    io.emit('chat message', 'Esta é uma mensagem simulada do PubNub.');
  }, 3000);
});

// Inicia o servidor na porta 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escutando na porta ${PORT}`);
});
