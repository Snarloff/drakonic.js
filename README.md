# Drakonic - Sistema de Filas usando TypeORM (Versão Não Oficial)

O Drakonic é uma biblioteca que permite a implementação de sistemas de filas em aplicações Node.js utilizando o TypeORM como ORM (Object-Relational Mapping). Com o Drakonic, os desenvolvedores podem facilmente criar e gerenciar filas de processamento assíncrono, permitindo que determinadas tarefas sejam executadas em segundo plano de forma eficiente e confiável.

## Instalação

Para instalar o Drakonic em seu projeto, basta executar o seguinte comando:

```bash
npm install drakonic.js --save
```

```bash
pnpm add drakonic.js
```

```bash
yarn add drakonic.js
```

## Uso Básico

### Configuração

Para utilizar o Drakonic, primeiro você precisa configurar a conexão com o banco de dados. O Drakonic suporta três tipos de banco de dados: MySQL, PostgreSQL e SQLite. Você pode configurar a conexão passando o tipo de conector (connector) e as informações específicas do banco de dados.

Exemplo de configuração para MySQL:

```typescript
import { Drakonic, Connectors } from 'drakonic.js';

const connector = Connectors.MYSQL;
const databaseConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'my_database',
};

const drakonic = new Drakonic(connector, databaseConfig);
```

### Adicionando Tarefas à Fila

Você pode adicionar tarefas à fila chamando o método `add()` do Drakonic. Cada tarefa deve ter um tópico e um payload associado.

```typescript
const topic = 'send_email';
const payload = {
  data: {
    to: 'example@example.com',
    subject: 'Hello',
    body: 'Hello, world!',
  },
  attempts: 3, // Número de tentativas
  retryAt: '1h', // Tempo para tentar novamente em caso de falha
};

drakonic.add(topic, payload);
```

### Processando a Fila

Para iniciar o processamento da fila, você precisa chamar o método `start()` do Drakonic.

```typescript
drakonic.start();
```

Isso iniciará o processamento da fila em segundo plano. O Drakonic irá processar as tarefas na fila, executando cada uma conforme necessário.

### Tratamento de Erros

Você pode tratar erros durante o processamento da fila registrando um ouvinte (listener) para o evento de erro.

```typescript
drakonic.on('error', (error) => {
  console.error('Ocorreu um erro:', error);
});
```

Isso permitirá que você monitore e gerencie erros que ocorrem durante o processamento da fila.

### Finalizando e Removendo Tarefas

Ao processar uma tarefa da fila, você pode finalizá-la chamando o método `done()`. Isso removerá a tarefa da fila.

```typescript
drakonic.on('send_email', async (payload) => {
  await sendEmail(payload);
  payload.done();
});
```

Se ocorrer um erro ao processar uma tarefa, você pode marcar a tarefa como falha chamando o método `error()`. Isso manterá a tarefa na fila para tentativas futuras.

```typescript
drakonic.on('send_email', async (payload) => {
  try {
    await sendEmail(payload);
    payload.done();
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    payload.error();
  }
});
```

## Contribuindo

Contribuições são bem-vindas! Se você encontrar um problema ou tiver uma sugestão de melhoria, sinta-se à vontade para abrir uma issue ou enviar um pull request no [repositório do Drakonic no GitHub](https://github.com/seu-usuario/drakonic).

## Licença

Este projeto está licenciado sob a Licença MIT. Consulte o arquivo [LICENSE](./LICENSE) para obter mais detalhes.

## Autor

Este pacote foi criado por [Snarloff](https://github.com/Snarloff).

---

Espero que este README ajude a documentar o seu pacote Drakonic de forma clara e informativa! Se precisar de mais alguma coisa, não hesite em me avisar.
