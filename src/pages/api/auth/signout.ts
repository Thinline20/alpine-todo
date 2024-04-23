import type { APIContext } from "astro";
import { Effect } from "effect";

import { NoSessionError, CannotInvalidateSessionError } from "~/lib/error";
import { lucia } from "~/server/auth";

export async function POST(context: APIContext) {
  const postProgram = Effect.gen(function* (_) {
    if (!context.locals.session) {
      yield* _(Effect.fail(new NoSessionError()));
    }

    yield* _(invalidateSession(context.locals.session!.id));

    const sessionCookie = lucia.createBlankSessionCookie();
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

function invalidateSession(sessionId: string) {
  return Effect.tryPromise({
    try: () => lucia.invalidateSession(sessionId),
    catch: () => new CannotInvalidateSessionError(),
  });
}
