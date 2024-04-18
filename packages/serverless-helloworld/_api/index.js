export const edge = false;

/**
 * @param {import("@vercel/node").VercelRequest} request
 * @param {import("@vercel/node").VercelResponse} response
 */
export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.end("Hello World!");
}
