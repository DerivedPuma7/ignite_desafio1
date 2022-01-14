const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

/**
 * id - uuid
 * name - string
 * username - string
 * todos - []
 */
const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => {
    return user.username == username;
  })

  if (!user) {
    return response.status(404).json({ error: "Usuário não encontrato" });
  }

  request.user = user;

  return next();
}

function checksExistTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const tarefa = user.todos.find((todo) => {
    return todo.id == id
  });

  if (!tarefa) {
    return response.status(404).json({
      error: "Tarefa não encontrada"
    });
  }

  request.todo = tarefa;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({
      error: "Usuário já cadastrado"
    });
  }

  const id = uuidv4();

  const user = {
    name,
    username,
    id,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const todos = user.todos;

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const id = uuidv4();

  const todo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistTodo, (request, response) => {
  const { user, todo } = request;
  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistTodo, (request, response) => {
  const { user, todo } = request;

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistTodo, (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo, 1);

  return response.status(204).json(todo);
});

module.exports = app;