# Bingo da Família — versão inicial

## Executar

Requer Node.js 20 ou superior.

```bash
npm install
npm start
```

Acesse `http://localhost:3000`. Para jogar de outros celulares, publique o projeto em uma hospedagem Node.js com HTTPS e suporte a WebSocket (por exemplo Render ou Railway). O servidor deve rodar em **uma única instância** nesta versão.

## Funcionalidades
- Sala privada com código e limite de 20 pessoas
- Seleção exclusiva de 30 avatares emoji
- Cartelas 5×5 geradas com números B 1–15, I 16–30, N 31–45, G 46–60, O 61–75 e centro livre
- Sorteio criptograficamente aleatório sem repetição, controlado pelo administrador
- Atualização em tempo real, marcação manual, verificação de modalidades e anúncio coletivo
- Reconexão por token salvo no navegador

## Limitações antes de domingo
- Dados em memória: reiniciar o servidor apaga as salas e partidas. Para produção, adicionar persistência (SQLite/PostgreSQL) e backup.
- Sem autenticação forte: tokens locais dão acesso à sessão. Compartilhe apenas o código da sala, nunca o token de administrador.
- O sorteio é simultâneo por evento de rede, mas latências diferentes impedem exibição exatamente no mesmo milissegundo.
- O sorteio não pausa automaticamente durante anúncio de vitória; o administrador deve aguardar antes de sortear novamente.
- Não há garantia de cartelas globalmente únicas (colisões são extremamente improváveis, mas a regra não é aplicada).
- Não testado com 20 aparelhos reais nem sob quedas prolongadas de rede.
- O globo atual é uma animação simbólica; uma animação 3D pode ser adicionada depois.
- A interface não tem seleção visual de cartela: a cartela é atribuída ao entrar.
