const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

// Dados
let times = [];
let jogadores = [];
let partidas = [];
let gols = [];

// Funções
function getArtilheiro() {
  const artilheiroMap = {};
  gols.forEach((gol) => {
    if (artilheiroMap[gol.jogador]) {
      artilheiroMap[gol.jogador]++;
    } else {
      artilheiroMap[gol.jogador] = 1;
    }
  });

  let artilheiro = null;
  let maxGols = 0;
  for (const jogador in artilheiroMap) {
    if (artilheiroMap[jogador] > maxGols) {
      artilheiro = jogador;
      maxGols = artilheiroMap[jogador];
    }
  }

  return { jogador: artilheiro, gols: maxGols };
}

function validaTime(time) {
  const jogadoresDoTime = jogadores.filter((jogador) => jogador.time === time.name);
  return (
    jogadoresDoTime.length <= 23 &&
    jogadoresDoTime.length >= 13 &&
    jogadoresDoTime.filter((jogador) => jogador.posicao === "Goleiro").length >= 3
  );
}

// Rotas
app.post("/registerTeam", (req, res) => {
  const { teamName } = req.body;

  if (times.length < 8) {
    const jogadorTime = jogadores.filter((jogador) => jogador.time === teamName);

    if (validaTime({ name: teamName, jogadores: jogadorTime })) {
      times.push({ name: teamName, jogadores: jogadorTime });
      res.status(201).send("Time registrado com sucesso!");
    } else {
      res.status(400).send("Time não atende aos requisitos.");
    }
  } else {
    res.status(400).send("Limite de times atingido.");
  }
});

app.post("/registerJogador", (req, res) => {
  const { jogadorName, position, teamName } = req.body;

  jogadores.push({ name: jogadorName, position, team: teamName });
  res.status(201).send("Jogador registrado com sucesso!");
});

app.post("/scheduleMatch", (req, res) => {
  const { team1, team2 } = req.body;

  const time1 = times.find((time) => time.name === team1);
  const time2 = times.find((time) => time.name === team2);

  if (time1 && time2) {
    partidas.push({ team1: team1.name, team2: team2.name, score1: 0, score2: 0, winner: null });
    res.status(201).send("Partida marcada com sucesso!");
  } else {
    res.status(400).send("Times não encontrados.");
  }
});

app.post("/addgol", (req, res) => {
  const { matchId, jogador, team } = req.body;
  const match = partidas[matchId];

  if (
    match &&
    jogadores.find((jogador) => jogador.name === jogador) &&
    times.find((time) => time.name === team)
  ) {
    gols.push({ jogador, team });

    if (team === match.team1) {
      match.score1++;
    } else if (team === match.team2) {
      match.score2++;
    }

    res.status(201).send("Gol adicionado com sucesso!");
  } else {
    res.status(400).send("Partida ou jogador inválidos.");
  }
});

app.post("/declareWinner", (req, res) => {
  const { matchId } = req.body;
  const match = partidas[matchId];
  if (match) {
    if (match.score1 > match.score2) {
      match.winner = match.team1;
    } else if (match.score2 > match.score1) {
      match.winner = match.team2;
    } else {
      res.status(400).send("Empate!");
      return;
    }
    res.status(201).send(`Vencedor: ${match.winner}!`);
  } else {
    res.status(400).send("Partida não encontrada.");
  }
});

app.get("/Artilheiro", (req, res) => {
  const Artilheiro = getArtilheiro();
  res.status(200).send(Artilheiro);
});

app.get("/champion", (req, res) => {
  const finalMatch = partidas[partidas.length - 1];
  if (finalMatch && finalMatch.winner) {
    res.status(200).send({ champion: finalMatch.winner });
  } else {
    res.status(400).send("Partida final não concluída.");
  }
});

app.get("/partidas/:teamName", (req, res) => {
  const teamName = req.params.teamName;
  const teamPartidas = partidas.filter(
    (match) => match.team1 === teamName || match.team2 === teamName
  );
  res.status(200).send(teamPartidas);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
