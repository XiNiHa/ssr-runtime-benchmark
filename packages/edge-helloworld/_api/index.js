export const edge = true;

export default async function handler() {
  return new Response("Hello World!", {
    headers: {
      "Cache-Control": "no-store",
    }
  });
}
