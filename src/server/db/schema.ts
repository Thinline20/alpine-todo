import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").notNull().primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
});

export type User = typeof users.$inferSelect;

export const sessions = sqliteTable("sessions", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
});

export type Session = typeof sessions.$inferSelect;

export const todos = sqliteTable("todos", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  description: text("description").default(""),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Todo = typeof todos.$inferSelect;

export type NewTodo = typeof todos.$inferInsert;

export const tags = sqliteTable("tags", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull().unique(),
});

export type Tag = typeof tags.$inferSelect;

export type NewTag = typeof tags.$inferInsert;

export const todoTags = sqliteTable("todo_tags", {
  todoId: text("todo_id")
    .notNull()
    .references(() => todos.id),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id),
});

export type TodoTag = typeof todoTags.$inferSelect;

export type NewTodoTag = typeof todoTags.$inferInsert;