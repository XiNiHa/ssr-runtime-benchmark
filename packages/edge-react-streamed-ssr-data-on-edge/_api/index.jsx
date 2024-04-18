import { Suspense } from "react";
import { renderToReadableStream } from "react-dom/server";

export const edge = true;

/**
 * @param {Request} request
 */
export default async function handler(request) {
	const stream = await renderToReadableStream(
		<html lang="en">
			<body>
				<App host={request.headers.get("host")} />
			</body>
		</html>,
	);
	return new Response(stream, {
		headers: {
			"Cache-Control": "no-store",
			"Content-Type": "text/html; charset=utf-8",
		},
	});
}

/**
 * @param {{ host: string }} props
 */
const App = (props) => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<List host={props.host} />
		</Suspense>
	);
};

let data = null;

/**
 * @param {{ host: string }} props
 */
const List = (props) => {
	if (!data) {
		data = fetch(new URL("/api/data", `https://${props.host}`))
			.then((response) => response.json())
			.then((json) => {
				data = json;
			});
	}

	if ("then" in data) throw data;
	return (
		<ul>
			{data.data.map((id, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<li key={i}>{id}</li>
			))}
		</ul>
	);
};
