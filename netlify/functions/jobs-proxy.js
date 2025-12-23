// netlify/functions/jobs-proxy.js

// Netlify (Node 18+) has global fetch available
exports.handler = async () => {
  try {
    const url =
      'https://services1.myworkday.com/ccx/service/customreport2/benchmark/ISU_Benchmark_Job_Req/Benchmark_Job_Requisitions_XML_-_Deloitte?format=simplexml';

    const res = await fetch(url, {
      headers: { Accept: 'application/xml' }
    });

    const xml = await res.text();

    if (!res.ok) {
      console.error('Workday error:', res.status, xml);
      return {
        statusCode: res.status,
        body: 'Error loading Workday feed'
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        // you can lock this down later to just your Webflow domain
        'Access-Control-Allow-Origin': '*'
      },
      body: xml
    };
  } catch (err) {
    console.error('Proxy error:', err);
    return {
      statusCode: 500,
      body: 'Error loading Workday feed'
    };
  }
};