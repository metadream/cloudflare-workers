const upstream = '<bucket>.cos.<region>.myqcloud.com'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  url.host = upstream

  let response = await fetch(new Request(url, request))
  if (response.status < 400) {
    response = new Response(response.body, response)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }

  const text = await response.text()
  const message = text.match(/<Message>(.+)<\/Message>/)
  return new Response(response.status + ': ' + message[1], {
    status: response.status
  })
}