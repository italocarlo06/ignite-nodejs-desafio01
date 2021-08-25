const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers;
  const user = users.find( user => user.username === username );
  if (!user){
    return response.status(404).send({ error: "User not found!"});
  }
  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  // Complete aqui
  const { name, username } = request.body;

  const user = users.find( user => user.username === username );
  if (user){
    return response.status(400).send({ error: "User already registered!"});
  }

  const newuser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newuser);
  return response.status(201).json(newuser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {  
  const { user } = request;  
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline} = request.body;
  const { user } = request;
  
  const toDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),    
  } 
  user.todos.push(toDo);
  return response.status(201).json(toDo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find( todo => todo.id === id );
  if (!todo){
    response.status(404).json({ error : "todo not found!"});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;  
  const { id } = request.params;

  const todo = user.todos.find( todo => todo.id === id );
  if (!todo){
    response.status(404).json({ error : "todo not found!"});
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;  
  const { id } = request.params;

  const todo = user.todos.findIndex( todo => todo.id === id );
  
  if (todo === -1){
    return response.status(404).json({ error : "todo not found!"});
  }

  user.todos.splice(todo,1);

  return response.status(204).json(user.todos);
});

module.exports = app;