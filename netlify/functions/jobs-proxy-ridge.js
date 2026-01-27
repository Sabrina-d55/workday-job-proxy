// netlify/functions/jobs-proxy-ridge.js

const WORKDAY_URL =
  "https://services1.myworkday.com/ccx/service/customreport2/benchmark/ISU_Benchmark_Job_Req/Benchmark_Job_Requisitions_XML_-_Ridge?format=simplexml";

exports.handler = async () => {
  const baseHeaders = {
    "Content-Type": "application/xml",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    // Optional caching (5 minutes)
    "Cache-Control": "public, max-age=300, s-maxage=300",
  };

  try {
    const username = process.env.WORKDAY_USERNAME;
    const password = process.env.WORKDAY_PASSWORD;

    if (!username || !password) {
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: "Missing WORKDAY_USERNAME/WORKDAY_PASSWORD env vars",
      };
    }

    const authHeader =
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

    const res = await fetch(WORKDAY_URL, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/xml",
      },
    });

    const xml = await res.text();

    if (!res.ok) {
      console.error("Workday Ridge error:", res.status, xml);
      return {
        statusCode: res.status,
        headers: baseHeaders,
        body: `Workday request failed: ${res.status}`,
      };
    }

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: xml,
    };
  } catch (err) {
    console.error("Proxy Ridge error:", err);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: `Proxy error: ${err.message || "Unknown error"}`,
    };
  }
};
