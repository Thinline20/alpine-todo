import { Effect } from "effect";

import { InvalidFormDataError } from "./error";

export function getFormData(request: Request) {
  return Effect.tryPromise({
    try: () => request.formData(),
    catch: () => new InvalidFormDataError(),
  });
}