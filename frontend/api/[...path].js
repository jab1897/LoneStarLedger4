// Proxies any /api/* request to your Render backend.
export default async function handler(req, res) {
  try {
    const backendBase =
      process.env.BACKEND_URL || "https://lonestarledger2-0.onrender.com";

    const tail = (req.query.path || []).join("/");
    const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    const target = `${backendBase}/api/${tail}${qs}`;

    const init = {
      method: req.method,
      headers: { ...req.headers, host: undefined },
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req
    };

    const r = await fetch(target, init);

    res.status(r.status);
    for (const [k, v] of r.headers.entries()) {
      if (!["content-encoding", "transfer-encoding"].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    }
    const buf = Buffer.from(await r.arrayBuffer());
    res.send(buf);
  } catch (e) {
    console.error("Proxy error:", e);
    res.status(502).json({ error: "Proxy failed", detail: String(e?.message || e) });
  }
}
