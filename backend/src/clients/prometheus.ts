import client from "prom-client";

export const register = new client.Registry();

register.setDefaultLabels({
    app: "ai_flash_cards",
});

const collectDefaultMetrics = client.collectDefaultMetrics;
const appName = "ai_flash_cards_backend"

export const http_request_counter = new client.Counter({
    name: `${appName}_http_request_count`,
    help: 'Count of HTTP requests',
    labelNames: ['method', 'route', 'statusCode']
});

// const restResponseTimeHistogram = new client.Histogram({
//     name: 'rest_response_time_duration_seconds',
//     help: 'REST API response time in seconds',
//     labelNames: ['method', 'route', 'status_code']
// });

register.registerMetric(http_request_counter);

collectDefaultMetrics({
    register
});