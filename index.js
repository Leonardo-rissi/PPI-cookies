const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: "segredo",
    resave: false,
    saveUninitialized: true,
  }),
);

let produtos = [];

function estaAutenticado(req, res, next) {
  if (req.session.usuario) {
    next();
  } else {
    res.write(`
        <h2>Você precisa fazer login primeiro</h2>
        <a href="/login">Ir para login</a>
        `);
  }
}

app.get("/login", (req, res) => {
  res.write(`
    <html>
    <head>
    <title>Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body>

    <div class="container mt-5">

    <h2>Login</h2>

    <form method="POST" action="/login">

    <label>Usuário</label>
    <input type="text" name="usuario" class="form-control">

    <label>Senha</label>
    <input type="password" name="senha" class="form-control">

    <br>

    <button class="btn btn-primary">Entrar</button>

    </form>

    </div>

    </body>
    </html>
    `);
});
app.get("/", (req, res) => {
  res.write(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Sistema</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">

  </head>

  <body>

  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">

      <a class="navbar-brand" href="/">Sistema</a>

      <ul class="navbar-nav">

        <li class="nav-item">
          <a class="nav-link" href="/">Inicio</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="/login">Login</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="/produto">Cadastrar Produto</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="/produtos">Produtos</a>
        </li>

      </ul>

    </div>
  </nav>

  <div class="container mt-4">
    <h1>Bem-vindo ao sistema</h1>
    <p>Escolha uma opcao no menu.</p>
  </div>

  </body>
  </html>
  `);
});

app.post("/login", (req, res) => {
  const usuario = req.body.usuario;

  req.session.usuario = usuario;

  res.cookie("ultimoAcesso", new Date().toLocaleString());

  res.redirect("/produto");
});

app.get("/produto", estaAutenticado, (req, res) => {
  const ultimo = req.cookies.ultimoAcesso || "Primeiro acesso";

  res.write(`
    <html>

    <head>
    <title>Cadastro de Produto</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body>

    <div class="container mt-5">

    <h3>Usuário logado: ${req.session.usuario}</h3>

    <p>Último acesso: ${ultimo}</p>

    <h2>Cadastro de Produto</h2>

    <form method="POST" action="/produto">

    <label>Código de barras</label>
    <input type="text" name="codigo" class="form-control">

    <label>Descrição</label>
    <input type="text" name="descricao" class="form-control">

    <label>Preço de custo</label>
    <input type="number" name="custo" class="form-control">

    <label>Preço de venda</label>
    <input type="number" name="venda" class="form-control">

    <label>Data de validade</label>
    <input type="date" name="validade" class="form-control">

    <label>Quantidade em estoque</label>
    <input type="number" name="estoque" class="form-control">

    <label>Fabricante</label>
    <input type="text" name="fabricante" class="form-control">

    <br>

    <button class="btn btn-success">
    Cadastrar
    </button>

    </form>

    <br>

    <a href="/produtos" class="btn btn-primary">
    Ver produtos cadastrados
    </a>

    </div>

    </body>

    </html>
    `);
});

app.post("/produto", estaAutenticado, (req, res) => {
  const produto = {
    codigo: req.body.codigo,
    descricao: req.body.descricao,
    custo: req.body.custo,
    venda: req.body.venda,
    validade: req.body.validade,
    estoque: req.body.estoque,
    fabricante: req.body.fabricante,
  };

  produtos.push(produto);

  res.write("/produtos");
});

app.get("/produtos", estaAutenticado, (req, res) => {
  let tabela = `
    <html>
    <head>
    <title>Lista de Produtos</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body>

    <div class="container mt-5">

    <h2>Produtos Cadastrados</h2>

    <table class="table table-striped">

    <tr>
    <th>ID</th>
    <th>Código</th>
    <th>Descrição</th>
    <th>Custo</th>
    <th>Venda</th>
    <th>Validade</th>
    <th>Estoque</th>
    <th>Fabricante</th>
    </tr>
    `;

  for (let i = 0; i < produtos.length; i++) {
    let p = produtos[i];

    tabela += `
        <tr>
        <td>${i + 1}</td>
        <td>${p.codigo}</td>
        <td>${p.descricao}</td>
        <td>${p.custo}</td>
        <td>${p.venda}</td>
        <td>${p.validade}</td>
        <td>${p.estoque}</td>
        <td>${p.fabricante}</td>
        </tr>
        `;
  }

  tabela += `
    </table>

    <a href="/produto" class="btn btn-success">
    Novo Produto
    </a>

    </div>

    </body>

    </html>
    `;

  res.write(tabela);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
