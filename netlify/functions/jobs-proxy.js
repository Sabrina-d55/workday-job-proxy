// netlify/functions/jobs-proxy.js

const WORKDAY_URL =
  "https://services1.myworkday.com/ccx/service/customreport2/benchmark/ISU_Benchmark_Job_Req/Benchmark_Job_Requisitions_XML_-_Deloitte?format=simplexml";

// in-memory cache (per Netlify function instance)
let cachedXml = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

exports.handler = async () => {
  const baseHeaders = {
    "Content-Type": "application/xml",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    // let browser + CDN cache this for 5 minutes
    "Cache-Control": "public, max-age=300, s-maxage=300",
  };

  try {
    const username = process.env.WORKDAY_USERNAME;
    const password = process.env.WORKDAY_PASSWORD;

    if (!username || !password) {
      console.error("Missing WORKDAY_USERNAME or WORKDAY_PASSWORD");
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: "Server not configured with Workday credentials.",
      };
    }

    const now = Date.now();

    // ✅ Serve from cache if still fresh
    if (cachedXml && now - cachedAt < CACHE_TTL_MS) {
      return {
        statusCode: 200,
        headers: baseHeaders,
        body: cachedXml,
      };
    }

    // Otherwise call Workday
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
      console.error("Workday error:", res.status, xml);
      return {
        statusCode: res.status,
        headers: baseHeaders,
        body: `Workday request failed: ${res.status} ${res.statusText || ""}`,
      };
    }

    // ✅ Save to cache
    cachedXml = xml;
    cachedAt = now;

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: xml,
    };
  } catch (err) {
    console.error("Proxy error:", err);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: `Proxy error: ${err.message || "Unknown error"}`,
    };
  }
};
