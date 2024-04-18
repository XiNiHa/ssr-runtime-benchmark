import { request } from "undici";

const ITERATIONS = 1000;

/**
 * @type {[string, ReturnType<typeof makeHandler>][]}
 */
const handlers = [
	["edge-helloworld", process.env.EDGE_HELLOWORLD_URL],
	["serverless-helloworld", process.env.SERVERLESS_HELLOWORLD_URL],
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
				min: values[0],
				max: values[values.length - 1],
				avg: values.reduce((acc, value) => acc + value, 0) / values.length,
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

console.log(JSON.stringify(results, null, 2));

/**
 * @param {string} url
 * @returns {() => Promise<{ start: number, headerReceived: number, closed: number }>}
 */
function makeHandler(url) {
	return async () => {
		const start = performance.now();
		const response = await request(url);
		const headerReceived = performance.now() - start;
		const body = await response.body.text();
		const total = performance.now() - start;
		return { headerReceived, closed: total };
	};
}
