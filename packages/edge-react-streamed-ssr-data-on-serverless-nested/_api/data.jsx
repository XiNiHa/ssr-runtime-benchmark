export const edge = false;

export async function GET() {
	await new Promise((resolve) => setTimeout(resolve, 100));
	return new Response(
		JSON.stringify({
			data: Array(50)
				.fill(0)
				.map((_, i) => crypto.randomUUID()),
		}),
		{
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
}
