
const socket = io();
const $ = id => document.getElementById(id);

const avatars = [
  '👨','👩','👦','👧','👨‍🍳','👩‍🚀',
  '🧑‍🎤','🧙','🦸','🥷','🐶','🐱',
  '🦊','🐻','🐼','🐸','🐵','🦁',
  '🐯','🐰','👹','👾','👽','🤖',
  '👻','💀','🐲','🧟','🧌','🦄'
];

const modeNames = {
  corners: 'Quatro cantos',
  row: 'Linha',
  column: 'Coluna',
  diagonal: 'Diagonal',
  full: 'Cartela cheia'
};

let me = null;
let state = null;
let marked = [];

const notice = msg => {
  $('notice').textContent = msg;

  setTimeout(() => {
    if ($('notice').textContent === msg) {
      $('notice').textContent = '';
    }
  }, 6000);
};

const request = (event, data, fn) => {
  socket.emit(event, data, res => {
    if (!res?.ok) {
      return notice(res?.error || 'Falha na conexão');
    }

    fn?.(res);
  });
};

function connect(res) {
  me = {
    code: res.code,
    token: res.token,
    id: res.playerId,
    admin: res.admin,
    card: res.card
  };

  marked = res.marked || [];

  localStorage.setItem(
    'bingo-session',
    JSON.stringify({
      code: res.code,
      token: res.token,
      name: $('name').value
    })
  );

  $('entrance').classList.add('hidden');
  $('code').textContent = res.code;

  renderBoard();
}

// CRIAR SALA
$('create').onclick = () => {
  const name = $('name').value.trim();

  if (!name) {
    return notice('Informe seu nome para criar uma sala.');
  }

  request('create', { name }, connect);
};

// ENTRAR NA SALA
$('join').onclick = () => {
  const name = $('name').value.trim();
  const code = $('roomCode').value.trim().toUpperCase();

  if (!name) {
    return notice('Informe seu nome.');
  }

  if (!code) {
    return notice('Informe o código da sala.');
  }

  // Se for a sala anterior, recupera a sessão.
  // Caso contrário, entra como novo participante.
  let saved = null;

  try {
    saved = JSON.parse(
      localStorage.getItem('bingo-session') || 'null'
    );
  } catch {
    localStorage.removeItem('bingo-session');
  }

  const data = { name, code };

  if (
    saved &&
    saved.code === code &&
    saved.name === name &&
    saved.token
  ) {
    data.token = saved.token;
  }

  request('join', data, connect);
};

// RECUPERA APENAS OS CAMPOS, SEM ENTRAR NA SALA
let previous = null;

try {
  previous = JSON.parse(
    localStorage.getItem('bingo-session') || 'null'
  );
} catch {
  localStorage.removeItem('bingo-session');
}

if (previous) {
  $('name').value = previous.name || '';
  $('roomCode').value = previous.code || '';
}

// RECONEXÃO APENAS DURANTE UMA SESSÃO ATIVA
socket.on('connect', () => {
  if (me) {
    request('join', {
      code: me.code,
      token: me.token
    }, connect);
  }
});

socket.on('session-replaced', () => {
  me = null;
  state = null;
  marked = [];

  $('entrance').classList.remove('hidden');
  $('lobby').classList.add('hidden');
  $('game').classList.add('hidden');

  notice('Sua sessão foi aberta em outro dispositivo.');
});

// RENDERIZAR CARTELA
function renderBoard() {
  if (!me) return;

  const board = $('board');
  board.innerHTML = '';

  'BINGO'.split('').forEach(letter => {
    const d = document.createElement('div');

    d.className = 'cell head';
    d.style.display = 'grid';
    d.style.placeItems = 'center';
    d.textContent = letter;

    board.append(d);
  });

  me.card.forEach(row => {
    row.forEach(n => {
      const b = document.createElement('button');

      b.className =
        'cell' +
        (n === 0 || marked.includes(n) ? ' marked' : '');

      b.textContent = n || '★';
      b.disabled = n === 0;

      b.onclick = () => {
        request('mark', n, res => {
          marked = res.marked;
          renderBoard();
        });
      };

      board.append(b);
    });
  });
}

// ATUALIZAR INTERFACE
function render() {
  if (!me || !state) return;

  const lobby = state.status === 'lobby';

  $('lobby').classList.toggle('hidden', !lobby);
  $('game').classList.toggle('hidden', lobby);

  $('adminLobby').classList.toggle('hidden', !me.admin);
  $('draw').classList.toggle('hidden', !me.admin);

  const mine = state.players.find(p => p.id === me.id);

  $('myStatus').textContent = mine?.ready
    ? 'Você está pronto!'
    : 'Aguardando confirmação';

  $('ready').textContent = mine?.ready
    ? 'Cancelar pronto'
    : 'Estou pronto';

  $('ready').disabled = mine?.avatar == null;

  // PERSONAGENS
  $('avatars').innerHTML = '';

  avatars.forEach((emoji, i) => {
    const b = document.createElement('button');

    b.className =
      'avatar' +
      (mine?.avatar === i ? ' selected' : '');

    b.textContent = emoji;

    b.disabled = state.players.some(
      p => p.id !== me.id && p.avatar === i
    );

    b.onclick = () => request('avatar', i);

    $('avatars').append(b);
  });

  // PARTICIPANTES
  $('players').innerHTML = '';

  state.players.forEach(p => {
    const d = document.createElement('div');

    d.className = 'avatar';

    d.textContent =
      (p.avatar == null ? '❔' : avatars[p.avatar]) +
      ' ' +
      p.name;

    const s = document.createElement('div');

    s.className = 'small';

    s.textContent =
      (p.ready ? '✓ Pronto' : 'Preparando') +
      (p.online ? '' : ' · Offline');

    d.append(s);
    $('players').append(d);
  });

  // INICIAR PARTIDA
  $('start').disabled =
    !state.players.length ||
    !state.players.every(
      p => p.ready && p.online && p.avatar != null
    );

  // MODALIDADES
  $('modes').innerHTML = '';

  Object.entries(modeNames).forEach(([key, title]) => {
    const label = document.createElement('label');
    const cb = document.createElement('input');

    cb.type = 'checkbox';
    cb.value = key;
    cb.checked = state.winningModes.includes(key);

    cb.onchange = () => {
      const selected = [
        ...$('modes').querySelectorAll('input:checked')
      ].map(e => e.value);

      request('modes', selected);
    };

    label.append(cb, ' ' + title);
    $('modes').append(label);
  });

  // SORTEIO
  const latest = state.drawn.at(-1);

  $('current').textContent = latest || '—';

  $('count').textContent =
    `${state.drawn.length} de 75 bolas sorteadas`;

  $('history').innerHTML = '';

  state.drawn.forEach(n => {
    const span = document.createElement('span');

    span.textContent = n;
    $('history').append(span);
  });

  // VENCEDORES
  $('wins').textContent = state.wins.length
    ? state.wins
        .map(w => `${w.name} — ${modeNames[w.mode]}`)
        .join(' | ')
    : 'Ainda não houve vencedores.';
}

// EVENTOS DO SERVIDOR
socket.on('state', s => {
  state = s;
  render();
});

socket.on('ball', ({ ball }) => {
  notice('Saiu a bola ' + ball);
});

socket.on('winner', w => {
  $('winnerName').textContent =
    `${avatars[w.avatar] || '🏆'} ${w.name}`;

  $('winnerMode').textContent = modeNames[w.mode];

  $('winnerNumbers').textContent =
    'Números: ' + w.numbers.join(', ');

  $('winnerModal').classList.remove('hidden');
});

// BOTÕES
$('closeWinner').onclick = () => {
  $('winnerModal').classList.add('hidden');
};

$('ready').onclick = () => {
  if (!me || !state) return;

  const mine = state.players.find(p => p.id === me.id);

  request('ready', !mine?.ready);
};

$('start').onclick = () => {
  request('start', {});
};

$('draw').onclick = () => {
  request('draw', {});
};

$('bingo').onclick = () => {
  request('bingo', {});
};
