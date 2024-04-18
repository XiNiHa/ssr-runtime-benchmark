import { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";

export const edge = false;
export const config = {
  supportsResponseStreaming: true,
};

/**
 * @param {import("@vercel/node").VercelRequest} request
 * @param {import("@vercel/node").VercelResponse} response
 */
export default async function handler(request, response) {
	const { pipe } = renderToPipeableStream(
		<html lang="en">
			<body>
				<App host={request.headers.host} />
			</body>
		</html>,
		{
			onShellReady: () => {
				response.setHeader("Cache-Control", "no-store");
				response.setHeader("Content-Type", "text/html; charset=utf-8");
				response.setHeader("Transfer-Encoding", "chunked");
				pipe(response);
			}
		}
	);
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

let value = null;

/**
 * @param {{ host: string }} props
 */
const List = (props) => {
	if (!value) {
		value = fetch(new URL("/api/data", `https://${props.host}`))
			.then((response) => response.json())
			.then((json) => {
				value = json;
			});
	}

	if ("then" in value) throw value;
	const { data } = value;
	value = null;
	return (
		<ul>
			{data.map((id, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<li key={i}>{id}</li>
			))}
		</ul>
	);
};
