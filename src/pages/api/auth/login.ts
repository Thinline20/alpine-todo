import type { APIContext } from "astro";
import { Effect } from "effect";

import { lucia } from "~/server/auth";
import {
  createSession,
  getFormData,
  ValidatePassword,
  validateUsername,
} from "./signup";
import { Argon2id } from "oslo/password";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { users } from "~/server/db/schema";
import { IncorrectFormDataError } from "~/lib/error";

export async function POST(context: APIContext) {
  const postProgram = Effect.gen(function* (_) {
    const formData = yield* _(getFormData(context.request));

    const username = yield* _(
      validateUsername(formData.get("username")?.toString()),
    );
    const password = yield* _(
      ValidatePassword(formData.get("password")?.toString()),
    );

    const existingUser = yield* _(fetchUser(username));

    if (existingUser === undefined) {
      validateHashedPassword("", "");
      yield* _(Effect.fail(new IncorrectFormDataError()));
    }

    yield* _(validateHashedPassword(existingUser!.password, password));

    const session = yield* _(createSession(existingUser!.id));
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return new Response(null, { status: 200 });
  });

  return Effect.runPromise(postProgram)
    .then((res) => res)
    .catch((error) => new Response(error, { status: 400 }));
}

function validateHashedPassword(
  existingUserPassword: string,
  password: string,
) {
  return Effect.tryPromise({
    try: () => new Argon2id().verify(existingUserPassword, password),
    catch: () => new IncorrectFormDataError(),
  });
}

function fetchUser(username: string) {
  return Effect.tryPromise({
    try: () =>
      db.query.users.findFirst({
        where: eq(users.username, username),
      }),
    catch: () => new IncorrectFormDataError(),
  });
}
