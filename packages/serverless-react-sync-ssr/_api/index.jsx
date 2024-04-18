import { renderToString } from "react-dom/server";

export const edge = false;

/**
 * @param {import("@vercel/node").VercelRequest} request
 * @param {import("@vercel/node").VercelResponse} response
 */
export default async function handler(request, response) {
	const html = renderToString(<App />);

	response.setHeader("Cache-Control", "no-store");
	response.setHeader("Content-Type", "text/html; charset=utf-8");
	response.end(html);
}

const App = () => {
	return (
		<ul>
			{Array(1000)
				.fill(0)
				.map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<li key={i}>{crypto.randomUUID()}</li>
				))}
		</ul>
	);
};
