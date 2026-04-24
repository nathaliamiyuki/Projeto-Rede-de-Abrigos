# Desafio Tecnico Final - Rede de Abrigos

## 1 - Apresentacao da Ideia
Este projeto surgiu a partir da observação de um problema real em cenarios de enchente: as informações sobre abrigos e pedidos urgentes existem, mas ficam espalhadas em redes sociais e aplicativos de mensagem. A proposta da **Rede de Abrigos** e centralizar dados essenciais para reduzir tempo de resposta e melhorar a comunicação entre pessoas afetadas, voluntarios e equipes de apoio.

## 2 - Problema Escolhido
Foi escolhido o **Caso 1 - Falta de Informação sobre Abrigos**.

Durante emergencias, familias precisam saber rapidamente:
- onde existem abrigos ativos;
- se ainda ha vagas disponiveis;
- quais locais aceitam pets;
- como registrar solicitações de ajuda para priorização de atendimento.

## 3 - Solução Proposta
A solução implementada foi uma plataforma web integrada com API, com foco em simplicidade e uso rapido em contexto de crise.

Componentes principais:
- **consulta publica de abrigos** com filtros por cidade e disponibilidade;
- **registro de pedidos de ajuda** por pessoas afetadas;
- **painel de voluntarios com acesso restrito por chave**, para visualizar e atualizar status dos pedidos (`aberto`, `em_andamento`, `atendido`);
- **persistencia em PostgreSQL** para manter dados organizados e consistentes.

Com essa abordagem, o sistema conecta quem precisa de ajuda com quem pode ajudar, de forma mais estruturada e confiavel.

## 4 - Estrutura do Sistema

### front-end
Pasta: `frontend/`

Aplicacao web em HTML/CSS/JavaScript com:
- listagem de abrigos e filtros;
- formulario de pedidos de ajuda;
- area de login de voluntario por chave;
- painel de voluntarios para acompanhamento operacional.

### back-end
Pasta: `backend/`

API REST em Node.js + Express com rotas:
- `GET /health` - verifica saude da API
- `GET /api/shelters` - lista abrigos
- `POST /api/shelters` - cadastra abrigo
- `PATCH /api/shelters/:id/occupancy` - atualiza ocupação do abrigo
- `POST /api/requests` - cria pedido de ajuda
- `GET /api/requests` - lista pedidos (**restrito a voluntarios**)
- `PATCH /api/requests/:id/status` - atualiza status (**restrito a voluntarios**)

### banco de dados
Banco: PostgreSQL

Tabelas principais:
- `shelters`
- `support_requests`

Script SQL de referencia: `backend/scripts/init.sql`

## Configuracao e Execucao

### 1) Configurar o PostgreSQL
Crie o banco `enchente_db` e copie `backend/.env.example` para `backend/.env`.

Exemplo de `.env`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=enchente_db
VOLUNTEER_ACCESS_KEY=voluntario123
```

### 2) Rodar o back-end
```bash
cd backend
npm install
npm run dev
```

API em: `http://localhost:3001`

### 3) Rodar o front-end
Opcao recomendada (servidor estatico):
```bash
cd frontend
npx serve .
```

Depois, abra a URL exibida no terminal (ex.: `http://localhost:3000`).

## Documentacao da API (Postman)
Importe a colecao:

`postman/Enchentes-Abrigos.postman_collection.json`

Observacao: para endpoints restritos, envie o header:
- `x-volunteer-key: <sua_chave>`

