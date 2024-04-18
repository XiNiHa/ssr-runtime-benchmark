export const edge = false;

/**
 * @param {import("@vercel/node").VercelRequest} request
 * @param {import("@vercel/node").VercelResponse} response
 */
export default async function handler(request, response) {
	await new Promise((resolve) => setTimeout(resolve, 100));
	response.json({
		data: Array(50)
			.fill(0)
			.map(() => crypto.randomUUID()),
	});
}
