import { Effect } from "effect";
import { atom, onMount } from "nanostores";
import { db } from "~/server/db";

import type { Todo } from "~/server/db/schema";

export const $todos = atom<Todo[]>([]);

export function $addTodo(todo: Todo) {
  $todos.value?.unshift(todo);
}

export function $toggleTodo(todoId: string, completed: boolean) {
  for (const todo of $todos.value!) {
    if (todo.id === todoId) {
      todo.completed = completed;
      break;
    }
  }
}

export function $getTodoById(todoId: string) {
  return $todos.get().find((todo) => todo.id === todoId);
}

export function $removeTodo(todoId: string) {
  $todos.set($todos.get().filter((todo) => todo.id !== todoId));
}