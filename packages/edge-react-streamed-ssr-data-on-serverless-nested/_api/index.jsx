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
			<List host={props.host} level={3} />
		</Suspense>
	);
};

const value = {};

/**
 * @param {{ host: string, level: number }} props
 */
const List = (props) => {
	if (!value[props.level]) {
		value[props.level] = fetch(new URL("/api/data", `https://${props.host}`))
			.then((response) => response.json())
			.then((json) => {
				value[props.level] = json;
			});
	}

	if ("then" in value[props.level]) throw value[props.level];
	const { data } = value[props.level];
	value[props.level] = null;
	return (
		<>
			<ul>
				{data.map((id, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<li key={i}>{id}</li>
				))}
			</ul>
			{props.level > 0 && (
				<Suspense fallback={<div>Loading...</div>}>
					<List host={props.host} level={props.level - 1} />
				</Suspense>
			)}
		</>
	);
};
