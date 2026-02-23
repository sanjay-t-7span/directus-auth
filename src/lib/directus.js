import { createDirectus, rest, authentication } from "@directus/sdk";

export function createDirectusClient() {
  const client = createDirectus(process.env.DIRECTUS_URL)
    .with(authentication("json"))
    .with(rest());

  return client;
}
