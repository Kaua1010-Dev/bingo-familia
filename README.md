# Bingo da Família 2.0

Bingo multiplayer de 75 bolas, até 20 jogadores por sala, uma cartela por participante. Interface móvel, seleção de personagem, marcação manual e validação de premiações no servidor.

## Render

- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start` (ou `node server.js`)
- Root Directory: vazio
- Deploy: GitHub `main`, Auto-Deploy habilitado

## Atualização pelo celular

Substitua os arquivos da raiz `server.js`, `package.json`, `README.md` e os arquivos dentro de `public/`: `index.html` e `app.js`. Não altere nomes nem envie a pasta inteira como subpasta do repositório. O GitHub pode receber arquivos em dois envios: primeiro na raiz e depois entrando na pasta `public`.

## Limitações importantes

As salas, cartelas, sorteios e marcações estão **na memória do processo Node.js**. Reiniciar, suspender ou publicar nova versão no Render apaga as salas em andamento. Não faça deploy durante a partida. Para persistência real é necessário um banco de dados externo e recuperação transacional, ainda não implementados.

## Testes essenciais

1. Criar sala com nome e sem código; confirmar que recebe código.
2. Atualizar página; confirmar que a sessão anterior **não** é retomada automaticamente.
3. Retomar sessão manualmente e verificar cartela.
4. Entrar com outro celular; escolher personagens diferentes e marcar pronto.
5. Iniciar pelo administrador; sortear e conferir a mesma bola nos dois celulares.
6. Marcar manualmente número sorteado; tentar marcar número não sorteado (deve ser recusado).
7. Validar bingo legítimo e rejeitar bingo inválido.
8. Testar reconexão e recarregamento.
