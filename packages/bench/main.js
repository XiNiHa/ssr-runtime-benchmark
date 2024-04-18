import { request } from "undici";

const ITERATIONS = 500;

/**
 * @type {[string, ReturnType<typeof makeHandler>][]}
 */
const handlers = [
	["edge-helloworld", process.env.EDGE_HELLOWORLD_URL],
	["serverless-helloworld", process.env.SERVERLESS_HELLOWORLD_URL],
	["edge-react-sync-ssr", process.env.EDGE_REACT_SYNC_SSR_URL],
	["serverless-react-sync-ssr", process.env.SERVERLESS_REACT_SYNC_SSR_URL],
	[
		"edge-react-streamed-ssr-data-on-edge",
		process.env.EDGE_REACT_STREAMED_SSR_DATA_ON_EDGE_URL,
	],
	[
		"edge-react-streamed-ssr-data-on-serverless",
		process.env.EDGE_REACT_STREAMED_SSR_DATA_ON_SERVERLESS_URL,
	],
	[
		"serverless-react-streamed-ssr-data-on-serverless",
		process.env.SERVERLESS_REACT_STREAMED_SSR_DATA_ON_SERVERLESS_URL,
	],
].map(([name, url]) => [name, makeHandler(url)]);

const results = {};
for (const [name, handler] of handlers) {
	console.log(`Benchmarking ${name}...`);
	/**
	 * @type {Awaited<ReturnType<typeof handler>>[]}
	 */
	const samples = [];
	for (let i = 0; i < ITERATIONS; i++) {
		const result = await handler();
		samples.push(result);
	}

	/**
	 * @type {[string, number[]][]}
	 */
	const grouped = Object.entries(
		samples.reduce((acc, result) => {
			for (const key in result) {
				acc[key] = (acc[key] ?? []).concat(result[key]);
			}
			return acc;
		}, {}),
	);
	for (const [, values] of grouped) {
		values.sort((a, b) => a - b);
	}
	const stats = grouped.map(([key, values]) => {
		return [
			key,
			{
				avg: values.reduce((acc, value) => acc + value, 0) / values.length,
				min: values[0],
				max: values[values.length - 1],
				p75: values[Math.ceil(values.length * 0.75) - 1],
				p99: values[Math.ceil(values.length * 0.99) - 1],
			},
		];
	});
	const formatted = Object.fromEntries(
		stats.map(([key, value]) => [
			key,
			Object.fromEntries(
				Object.entries(value).map(([k, v]) => [k, v.toFixed(2)]),
			),
		]),
	);
	results[name] = formatted;
}

for (const metric of ["headerReceived", "closed"]) {
	console.log(`\n${metric} comparisons:`);
	for (const names of [
		["edge-helloworld", "serverless-helloworld"],
		["edge-react-sync-ssr", "serverless-react-sync-ssr"],
		[
			"edge-react-streamed-ssr-data-on-edge",
			"edge-react-streamed-ssr-data-on-serverless",
			"serverless-react-streamed-ssr-data-on-serverless",
		],
	]) {
		sortLog(
			Object.fromEntries(names.map((name) => [name, results[name][metric]])),
		);
	}
}

/**
 * @param {string} url
 * @returns {() => Promise<{ start: number, headerReceived: number, closed: number }>}
 */
function makeHandler(url) {
	return async () => {
		const start = performance.now();
		const response = await request(`${url}/api`);
		const headerReceived = performance.now() - start;
		const body = await response.body.text();
		const total = performance.now() - start;
		return { headerReceived, closed: total };
	};
}

/**
 * @param {Record<string, Record<"min" | "max" | "avg" | "p75" | "p99", number>>} results
 * @param {"min" | "max" | "avg" | "p75" | "p99"} sortKey
 */
function sortLog(results, sortKey = "avg") {
	const sorted = Object.entries(results).sort(
		(a, b) => a[1][sortKey] - b[1][sortKey],
	);
	console.table(sorted.map(([name, value]) => ({ name, ...value })));
}
