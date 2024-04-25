import type { APIContext } from "astro";
import { eq, or } from "drizzle-orm";
import { Effect } from "effect";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";

import {
  DuplicateUserError,
  InvalidFormDataError,
  InvalidUsernameError,
  InvalidPasswordError,
  InvalidEmailError,
  Argon2Error,
  NetworkError,
  CannotCreateSessionError,
} from "~/lib/error";
import { getFormData } from "~/lib/effects";
import { lucia } from "~/server/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export async function POST(context: APIContext) {
  const postProgram = Effect.gen(function* (_) {
    const formData = yield* _(getFormData(context.request));

    const username = yield* _(
      validateUsername(formData.get("username")?.toString()),
    );
    const password = yield* _(
      ValidatePassword(formData.get("password")?.toString()),
    );
    const email = yield* _(validateEmail(formData.get("email")?.toString()));

    const userId = generateId(15);
    const hashedPassword = yield* _(hashPassword(password));

    const checkUser = yield* _(fetchDatabaseUser(username, email));

    if (checkUser !== undefined) {
      yield* _(Effect.fail(new DuplicateUserError()));
    }

    yield* _(createUser(userId, username, email, hashedPassword));

    const session = yield* _(createSession(userId));
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return new Response(null, { status: 200 });
  });

  return Effect.runPromise(postProgram)
    .then((result) => result)
    .catch((error) => new Response(error, { status: 400 }));
}

export function validateUsername(
  username: string | undefined,
): Effect.Effect<string, InvalidUsernameError> {
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-zA-Z0-9_-]+$/.test(username)
  ) {
    return Effect.fail(new InvalidUsernameError());
  } else {
    return Effect.succeed(username);
  }
}

export function ValidatePassword(
  password: string | undefined,
): Effect.Effect<string, InvalidPasswordError> {
  if (
    typeof password !== "string" ||
    /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*)$/.test(password)
  ) {
    return Effect.fail(new InvalidPasswordError());
  } else {
    return Effect.succeed(password);
  }
}

function validateEmail(
  email: string | undefined,
): Effect.Effect<string, InvalidEmailError> {
  if (
    typeof email !== "string" ||
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
  ) {
    return Effect.fail(new InvalidEmailError());
  } else {
    return Effect.succeed(email);
  }
}

function hashPassword(password: string) {
  return Effect.tryPromise({
    try: () => new Argon2id().hash(password),
    catch: () => new Argon2Error(),
  });
}

function fetchDatabaseUser(username: string, email: string) {
  return Effect.tryPromise({
    try: () =>
      db.query.users.findFirst({
        where: or(eq(users.username, username), eq(users.email, email)),
      }),
    catch: () => new NetworkError(),
  });
}

function createUser(
  userId: string,
  username: string,
  email: string,
  hashedPassword: string,
) {
  return Effect.tryPromise({
    try: () =>
      db.insert(users).values({
        id: userId,
        username: username,
        password: hashedPassword,
        email: email,
      }),
    catch: () => new NetworkError(),
  });
}

export function createSession(userId: string) {
  return Effect.tryPromise({
    try: () => lucia.createSession(userId, {}),
    catch: () => new CannotCreateSessionError(),
  });
}
