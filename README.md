# Sistema de Gestão de Estoque

Sistema completo de gestão de estoque desenvolvido com Next.js.

## 🚀 Recursos

- ✅ Dashboard com métricas e gráficos
- ✅ Cadastro e gerenciamento de produtos
- ✅ Controle de movimentações (entradas e saídas)
- ✅ Relatórios detalhados
- ✅ Persistência de dados com API Routes + JSON
- ✅ Interface moderna e responsiva

## 📦 Instalação

```bash
# Instalar dependências
yarn install

# Executar em desenvolvimento
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🗄️ Armazenamento de Dados

Os dados são armazenados em um arquivo JSON local (`data/estoque.json`):

- ✅ **Simples e fácil**: Sem necessidade de configurar banco de dados
- ✅ **Zero configuração**: Funciona imediatamente após instalar
- ✅ **Dados persistidos**: Os dados são salvos automaticamente no arquivo JSON
- ✅ **Backup fácil**: Basta copiar o arquivo `data/estoque.json`

### Estrutura dos Dados

O arquivo `data/estoque.json` contém:

```json
{
  "produtos": [...],
  "movimentacoes": [...]
}
```

### Backup e Restauração

Para fazer backup:
```bash
cp data/estoque.json data/estoque.backup.json
```

Para restaurar:
```bash
cp data/estoque.backup.json data/estoque.json
```

## 🏗️ Tecnologias

- **Next.js 16** - Framework React
- **API Routes** - Endpoints para CRUD de dados
- **JSON** - Armazenamento de dados
- **Tailwind CSS** - Estilização
- **React Context API** - Gerenciamento de estado

## 📁 Estrutura

```
app/
  ├── api/              # API Routes
  │   ├── produtos/     # Endpoints de produtos
  │   └── movimentacoes/# Endpoints de movimentações
  ├── components/       # Componentes reutilizáveis
  ├── dashboard/        # Página do dashboard
  ├── produtos/         # Gerenciamento de produtos
  ├── movimentacoes/    # Controle de movimentações
  └── relatorios/       # Relatórios

lib/
  ├── EstoqueContext.jsx  # Context para estado global
  └── data.js             # Funções para ler/escrever JSON

data/
  └── estoque.json        # Arquivo de dados (gerado automaticamente)
```

## 📝 API Endpoints

### Produtos
- `GET /api/produtos` - Listar todos os produtos
- `POST /api/produtos` - Criar novo produto
- `GET /api/produtos/[id]` - Buscar produto por ID
- `PUT /api/produtos/[id]` - Atualizar produto
- `DELETE /api/produtos/[id]` - Remover produto

### Movimentações
- `GET /api/movimentacoes` - Listar todas as movimentações
- `POST /api/movimentacoes` - Criar nova movimentação

## ⚠️ Nota

Este sistema usa um arquivo JSON para armazenamento de dados. Para ambientes de produção com múltiplos usuários ou grande volume de dados, recomenda-se migrar para um banco de dados apropriado (PostgreSQL, MySQL, MongoDB, etc.).
