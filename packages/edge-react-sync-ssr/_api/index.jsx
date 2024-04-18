import { renderToString } from "react-dom/server";

export const edge = true;

export default async function handler() {
	const html = renderToString(<App />);

	return new Response(html, {
		headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
		},
	});
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
