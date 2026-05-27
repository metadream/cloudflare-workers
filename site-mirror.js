const upstream = {
  desktop: 'https://zh.wikipedia.org',
  mobile: 'https://zh.m.wikipedia.org'
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const userAgent = request.headers.get('user-agent') || ''
  const upstreamAdapter = isMobile(userAgent) ? upstream.mobile : upstream.desktop
  const upstreamUrl = new URL(upstreamAdapter)

  const requestUrl = new URL(request.url)
  requestUrl.protocol = upstreamUrl.protocol
  requestUrl.host = upstreamUrl.host
  requestUrl.pathname = upstreamUrl.pathname + requestUrl.pathname

  return await fetch(new Request(requestUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  }))
}

function isMobile(userAgent) {
  const mobileAgents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
  for (const agent of mobileAgents) {
    if (userAgent.indexOf(agent) > 0) return true
  }
  return false
}