# SSR Runtime Benchmark

This repository contains a benchmark for the SSR runtimes of Vercel; Edge and Serverless.

## How to run

- `pnpm install`
- Visit each `edge-*` or `serverless-*` package and run `pnpm deploy` to setup the Vercel project and deploy the app.
- Visit the Vercel dashboard and change the serverless function location for each project to be closest to your physical location.
- Visit the `bench` package, copy `.env.example` as `.env.local`, update the URLs to your Vercel project URLs, and run `pnpm start` to run the benchmark.

## Reading the results

The results have two metrics: `headerReceived` and `closed`.

- `headerReceived` is the time it takes to receive the headers of the response. Obtained by checking the duration until the `Promise` returned by `fetch()` resolves.
- `closed` is the time it takes to receive the last byte of the response. Obtained by checking the duration until the `Promise` returned by `response.text()` resolves.

The benchmark cases are grouped by following:

- `edge-helloworld` and `serverless-helloworld` returns a Hello World text.
- `edge-react-sync-ssr` and `serverless-react-sync-ssr` synchronously renders a list of 1000 UUIDs.
- `edge-react-streamed-ssr-data-on-edge`, `edge-react-streamed-ssr-data-on-serverless`, and `serverless-react-streamed-ssr-data-on-serverless` performs a streaming render with a single data fetch. The data fetch have 100ms of delay.
  - `edge-react-streamed-ssr-data-on-edge` performs the fetch to the edge location.
  - `edge-react-streamed-ssr-data-on-serverless` and `serverless-react-streamed-ssr-data-on-serverless` performs the fetch to the serverless location.
- `edge-react-streamed-ssr-data-on-edge-nested`, `edge-react-streamed-ssr-data-on-serverless-nested`, and `serverless-react-streamed-ssr-data-on-serverless-nested` performs a streaming render with 3 nested data fetches, commonly referred as "waterfall". Each data fetch have 100ms of delay.
  - `edge-react-streamed-ssr-data-on-edge-nested` performs the fetch to the edge location.
  - `edge-react-streamed-ssr-data-on-serverless-nested` and `serverless-react-streamed-ssr-data-on-serverless-nested` performs the fetch to the serverless location.

## My Results

Closest edge location: `icn1` (ap-northeast-2)
Configured the serverless function location to be the same with the edge location.

```
headerReceived comparisons:
┌─────────┬─────────────────────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│ (index) │          name           │   avg   │   min   │   max    │   p75   │   p99   │
├─────────┼─────────────────────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│    0    │    'edge-helloworld'    │ '29.78' │ '18.76' │ '674.65' │ '29.28' │ '95.59' │
│    1    │ 'serverless-helloworld' │ '32.04' │ '19.80' │ '582.67' │ '34.43' │ '65.35' │
└─────────┴─────────────────────────┴─────────┴─────────┴──────────┴─────────┴─────────┘
┌─────────┬─────────────────────────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│ (index) │            name             │   avg   │   min   │   max    │   p75   │   p99   │
├─────────┼─────────────────────────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│    0    │ 'serverless-react-sync-ssr' │ '31.80' │ '22.31' │ '610.05' │ '31.11' │ '71.73' │
│    1    │    'edge-react-sync-ssr'    │ '33.09' │ '21.19' │ '696.60' │ '32.41' │ '84.14' │
└─────────┴─────────────────────────────┴─────────┴─────────┴──────────┴─────────┴─────────┘
┌─────────┬────────────────────────────────────────────────────┬─────────┬─────────┬───────────┬─────────┬──────────┐
│ (index) │                        name                        │   avg   │   min   │    max    │   p75   │   p99    │
├─────────┼────────────────────────────────────────────────────┼─────────┼─────────┼───────────┼─────────┼──────────┤
│    0    │ 'serverless-react-streamed-ssr-data-on-serverless' │ '28.89' │ '19.07' │ '1302.14' │ '27.45' │ '51.60'  │
│    1    │    'edge-react-streamed-ssr-data-on-serverless'    │ '32.07' │ '19.49' │ '1106.96' │ '30.57' │ '124.86' │
│    2    │       'edge-react-streamed-ssr-data-on-edge'       │ '42.78' │ '20.60' │ '1422.58' │ '32.55' │ '369.80' │
└─────────┴────────────────────────────────────────────────────┴─────────┴─────────┴───────────┴─────────┴──────────┘
┌─────────┬───────────────────────────────────────────────────────────┬──────────┬──────────┬───────────┬──────────┬──────────┐
│ (index) │                           name                            │   avg    │   min    │    max    │   p75    │   p99    │
├─────────┼───────────────────────────────────────────────────────────┼──────────┼──────────┼───────────┼──────────┼──────────┤
│    0    │       'edge-react-streamed-ssr-data-on-edge-nested'       │ '31.18'  │ '17.92'  │ '1057.35' │ '31.25'  │ '89.52'  │
│    1    │    'edge-react-streamed-ssr-data-on-serverless-nested'    │ '36.69'  │ '19.85'  │ '858.03'  │ '35.49'  │ '135.94' │
│    2    │ 'serverless-react-streamed-ssr-data-on-serverless-nested' │ '253.63' │ '212.91' │ '1325.17' │ '274.91' │ '371.70' │
└─────────┴───────────────────────────────────────────────────────────┴──────────┴──────────┴───────────┴──────────┴──────────┘

closed comparisons:
┌─────────┬─────────────────────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│ (index) │          name           │   avg   │   min   │   max    │   p75   │   p99   │
├─────────┼─────────────────────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│    0    │    'edge-helloworld'    │ '30.16' │ '18.91' │ '677.15' │ '29.77' │ '96.18' │
│    1    │ 'serverless-helloworld' │ '32.33' │ '20.01' │ '582.92' │ '34.78' │ '65.51' │
└─────────┴─────────────────────────┴─────────┴─────────┴──────────┴─────────┴─────────┘
┌─────────┬─────────────────────────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│ (index) │            name             │   avg   │   min   │   max    │   p75   │   p99   │
├─────────┼─────────────────────────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│    0    │ 'serverless-react-sync-ssr' │ '32.80' │ '23.01' │ '616.60' │ '32.07' │ '72.28' │
│    1    │    'edge-react-sync-ssr'    │ '34.28' │ '22.56' │ '703.07' │ '33.77' │ '91.50' │
└─────────┴─────────────────────────────┴─────────┴─────────┴──────────┴─────────┴─────────┘
┌─────────┬────────────────────────────────────────────────────┬──────────┬──────────┬───────────┬──────────┬──────────┐
│ (index) │                        name                        │   avg    │   min    │    max    │   p75    │   p99    │
├─────────┼────────────────────────────────────────────────────┼──────────┼──────────┼───────────┼──────────┼──────────┤
│    0    │ 'serverless-react-streamed-ssr-data-on-serverless' │ '155.31' │ '140.86' │ '1860.31' │ '153.19' │ '200.99' │
│    1    │    'edge-react-streamed-ssr-data-on-serverless'    │ '171.22' │ '146.55' │ '1567.65' │ '171.09' │ '292.03' │
│    2    │       'edge-react-streamed-ssr-data-on-edge'       │ '182.27' │ '146.49' │ '1696.63' │ '174.62' │ '509.93' │
└─────────┴────────────────────────────────────────────────────┴──────────┴──────────┴───────────┴──────────┴──────────┘
┌─────────┬───────────────────────────────────────────────────────────┬───────────┬───────────┬───────────┬───────────┬───────────┐
│ (index) │                           name                            │    avg    │    min    │    max    │    p75    │    p99    │
├─────────┼───────────────────────────────────────────────────────────┼───────────┼───────────┼───────────┼───────────┼───────────┤
│    0    │ 'serverless-react-streamed-ssr-data-on-serverless-nested' │ '371.18'  │ '334.38'  │ '1940.32' │ '370.76'  │ '511.93'  │
│    1    │       'edge-react-streamed-ssr-data-on-edge-nested'       │ '581.35'  │ '532.75'  │ '2576.70' │ '586.73'  │ '700.13'  │
│    2    │    'edge-react-streamed-ssr-data-on-serverless-nested'    │ '1400.63' │ '1318.74' │ '3282.33' │ '1427.35' │ '1596.55' │
└─────────┴───────────────────────────────────────────────────────────┴───────────┴───────────┴───────────┴───────────┴───────────┘
```
