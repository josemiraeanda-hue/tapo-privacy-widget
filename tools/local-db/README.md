# Base de dados local do JM API Vault

## O que isto faz

Cria uma base de dados **SQLite** local a partir dos dois catálogos já existentes no Git:
- `api-vault/knowledge.json` — registo técnico pesquisável do Vault;
- `research/catalog/sources.json` — catálogo alargado de fontes e investigação.

SQLite é um motor de base de dados que guarda tudo num único ficheiro (`.sqlite3`). Não precisa de servidor, conta cloud, Render, Docker ou subscrição. O ficheiro fica no teu equipamento e pode ser copiado/guardado como qualquer outro ficheiro.

O importador usa apenas Python e bibliotecas que já fazem parte do Python. Não instala dependências nem envia dados para a Internet.

## Criar a base de dados no Windows

1. Descarrega/clona o repositório GitHub para uma pasta local.
2. Abre o Terminal/PowerShell nessa pasta.
3. Executa:

```powershell
py -3 tools/local-db/create_database.py
```

Se o comando `py` não existir, tenta:

```powershell
python tools/local-db/create_database.py
```

O resultado é criado em:

```
api-vault/data/jm-vault.sqlite3
```

Executar novamente atualiza os registos a partir dos JSON atuais. O processo substitui apenas as tabelas importadas, não apaga outros dados que venham a ser acrescentados noutras tabelas.

## Abrir e consultar

Podes abrir o ficheiro com o **DB Browser for SQLite**, uma aplicação gráfica gratuita e open-source:
https://sqlitebrowser.org/dl/

Também podes consultar pela linha de comandos Python, sem instalar mais nada:

```powershell
py -3 -c "import sqlite3; c=sqlite3.connect('api-vault/data/jm-vault.sqlite3'); print(*c.execute('SELECT id,title,status FROM knowledge_entries ORDER BY category,title'), sep='\n')"
```

Pesquisa simples:

```powershell
py -3 -c "import sqlite3; c=sqlite3.connect('api-vault/data/jm-vault.sqlite3'); q='%TecDoc%'; print(*c.execute('SELECT title,status,url FROM knowledge_entries WHERE title LIKE ? OR summary LIKE ?', (q,q)), sep='\n')"
```

## Tabelas

- `knowledge_entries`: entradas do catálogo principal, com campos pesquisáveis e o registo JSON original.
- `research_sources`: fontes do catálogo de investigação, com campos pesquisáveis e o registo JSON original.
- `import_history`: data, ficheiro e número de registos importados em cada execução.

## Segurança e limites

- A base local não contém valores de tokens ou passwords: só importa os catálogos versionados no Git.
- O ficheiro SQLite é ignorado pelo Git para não ser publicado por acidente.
- O importador não altera o GitHub, o Render nem os serviços existentes.
- Esta primeira etapa cria armazenamento local e acesso direto por SQL. Não cria um túnel de rede nem expõe a base de dados à Internet.
- Para o ChatGPT consultar automaticamente a base que está no teu PC será necessária uma ponte local autenticada, porque o ChatGPT na cloud não consegue abrir diretamente ficheiros ou endereços `localhost` do teu computador. Essa ponte deve ser read-only por defeito e não deve expor a base de dados publicamente.

## Validação e atualização atómica

Os dois catálogos e o histórico são atualizados numa única transação. Uma falha
no segundo catálogo reverte também a alteração do primeiro. Os campos `entries`
e `sources` têm de existir explicitamente; IDs vazios, nulos ou repetidos são
rejeitados. Uma lista vazia explícita continua a representar um catálogo vazio.
Outras tabelas locais são preservadas.

Testes sem serviços externos:

```sh
python3 -m unittest discover -s tools/local-db -p 'test_*.py'
```

As funções de importação usam a transação do chamador; não fazem commit isolado.
O conteúdo original de cada registo fica preservado em `source_json`. O programa
não certifica a ausência de segredos nos JSON de entrada: estes devem continuar
sem credenciais, como exige a política do repositório.
