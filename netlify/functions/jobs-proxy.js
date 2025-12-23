// netlify/functions/jobs-proxy.js

exports.handler = async () => {
  const WORKDAY_URL =
    'https://services1.myworkday.com/ccx/service/customreport2/benchmark/ISU_Benchmark_Job_Req/Benchmark_Job_Requisitions_XML_-_Deloitte?format=simplexml';

  try {
    const username = process.env.WORKDAY_USERNAME;
    const password = process.env.WORKDAY_PASSWORD;

    if (!username || !password) {
      console.error('Missing WORKDAY_USERNAME or WORKDAY_PASSWORD');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: 'Server not configured with Workday credentials.'
      };
    }

    const authHeader =
      'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

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
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: `Workday request failed: ${res.status} ${res.statusText || ''}`
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: xml
    };
  } catch (err) {
    console.error('Proxy error:', err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: `Proxy error: ${err.message || 'Unknown error'}`
    };
  }
};
