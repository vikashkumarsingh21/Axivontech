async function run() {
  const home = await fetch("https://axivontech.in/");
  console.log("HOME:", {
    status: home.status,
    cache: home.headers.get("cache-control"),
    encoding: home.headers.get("content-encoding"),
    server: home.headers.get("server"),
  });

  const login = await fetch("https://axivontech.in/login");
  console.log("LOGIN:", {
    status: login.status,
    cache: login.headers.get("cache-control"),
    encoding: login.headers.get("content-encoding"),
  });

  const html = await home.text();
  const scriptMatch = html.match(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/);
  if (scriptMatch) {
    const chunkUrl = "https://axivontech.in" + scriptMatch[1];
    const chunkRes = await fetch(chunkUrl);
    console.log("STATIC CHUNK:", {
      url: scriptMatch[1],
      status: chunkRes.status,
      cache: chunkRes.headers.get("cache-control"),
      encoding: chunkRes.headers.get("content-encoding"),
    });
  }

  const imgMatch = html.match(/src="(\/_next\/image\?[^"]+)"/);
  if (imgMatch) {
    const imgUrl = "https://axivontech.in" + imgMatch[1].replace(/&amp;/g, "&");
    const imgRes = await fetch(imgUrl);
    console.log("NEXT IMAGE:", {
      status: imgRes.status,
      cache: imgRes.headers.get("cache-control"),
      encoding: imgRes.headers.get("content-encoding"),
      type: imgRes.headers.get("content-type"),
    });
  }

  // Check Google fonts
  const fontMatch = html.match(/href="(https:\/\/fonts\.googleapis\.com\/[^"]+)"/);
  if (fontMatch) {
    const fontRes = await fetch(fontMatch[1]);
    console.log("FONT:", {
      url: fontMatch[1],
      status: fontRes.status,
      cache: fontRes.headers.get("cache-control"),
      encoding: fontRes.headers.get("content-encoding"),
    });
  }
}

run().catch(console.error);
