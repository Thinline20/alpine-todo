import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").notNull().primaryKey(),
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
