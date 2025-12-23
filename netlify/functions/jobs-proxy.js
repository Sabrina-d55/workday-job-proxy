// netlify/functions/jobs-proxy.js

// CommonJS style so Netlify is happy regardless of runtime
exports.handler = async (event) => {
  const WORKDAY_URL =
    'https://services1.myworkday.com/ccx/service/customreport2/benchmark/ISU_Benchmark_Job_Req/Benchmark_Job_Requisitions_XML_-_Deloitte?format=simplexml';

  try {
    const username = process.env.WORKDAY_USERNAME;
    const password = process.env.WORKDAY_PASSWORD;

    if (!username || !password) {
      console.error('Missing WORKDAY_USERNAME or WORKDAY_PASSWORD');
      return {
        statusCode: 500,
        body: 'Server not configured with Workday credentials.'
      };
    }

    // Build Basic Auth header
    const authHeader =
      'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    // Multi-origin CORS support
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    const origin = event.headers.origin;
    const corsOrigin = allowedOrigins.includes(origin) ? origin : '';

    // Call Workday
    const res = await fetch(WORKDAY_URL, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        Accept: 'application/xml'
      }
    });

    const xml = await res.text();

    if (!res.ok) {
      console.error('Workday error:', res.status, xml);
      return {
        statusCode: res.status,
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: `Workday request failed: ${res.status} ${res.statusText || ''}`
      };
    }

    // Success: return XML to browser
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: xml
    };
  } catch (err) {
    console.error('Proxy error:', err);
    return {
      statusCode: 500,
      body: `Proxy error: ${err.message || 'Unknown error'}`
    };
  }
};
