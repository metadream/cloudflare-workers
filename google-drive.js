/*
 * ----------------------------------------------
 * Google drive API authorization
 * ----------------------------------------------
 */
const config = {
  root_id: 'root', // root or directory id
  client_id: '162524057780-ujb4as2j25g34eI8rQRt3th8ma0f.apps.googleusercontent.com', // faked
  client_secret: 'XtDkt529NohNc9Oziz9IALfV', // faked
  refresh_token: '1//0e_CgYIaRjZn8SSNwF-L9IrurlUlnFZ-_LrG18PhQBLJzi8Y8B-pHbRAAGA4UxVP-523gjk4hm7udBjkEMWYipdDfU8h7PF8Y', // faked
}

/*
 * ----------------------------------------------
 * Index page template
 * ----------------------------------------------
 */
const tpl = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"/>
  <link rel="icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAS1BMVEUAAAAAwlAAw08Aw1AAzFcAwk8AwVMAwlAAwlAAwlAAwlAAwlAAxFAAwlAAwlAAwlAAw1AAw1AAwlAAwk4AwlAAwk8AwlAAwFEAwlCXGrq0AAAAGHRSTlMAu3auBS0T9dNP7p8f4cWLYwvpPb+X2jlBNxsqAAAA60lEQVQ4y62TWRKDMAxDTRKWsrVlaXX/kzbjJtZMyCfvS/aAUeQgNxJ8Y/ggVxxAnFyYewBDo2zoZynxiPi/3k2RBzBNwEOUrMh7wdh1G5a3llmRJ/ASeQFPiWRFWmCVyAq0IqbIoSUfpOJAfqpQtJTsjx1tS3moHZGJBy9jCQP6A9gtuj13Z1uHi5EPQStVqSvssFaVupzJiVnF7tdcLS4SO6tzSXkBJltHDRnxCSmZGqM6sWwJXYaPJsbtkO4/PXo70zoKzpRwA7RcB2mBw0R5x/KLNqp+S08zwxtPNq5bHKq46l9HfJBb+AHKIRqF8dHKIQAAAABJRU5ErkJggg=="/>
  <title>Google Drive</title>
  <style>*{box-sizing:border-box}body{font:15px/1.3 system-ui,-apple-system,BlinkMacSystemFont,Helvetica,Arial,Tahoma,"PingFang SC","Hiragino Sans GB","Heiti SC","Microsoft YaHei",sans-serif;background:#fcfcfc}h3,main{background:#fff;max-width:960px;margin:10px auto;border-radius:5px}h3{font-size:18px;padding:15px;border:#48d582 1px solid;color:#00c250}a{color:inherit;text-decoration:none}h3 a,main a{display:flex;align-items:center}main a:first-child{border-top-left-radius:5px;border-top-right-radius:5px}main a:last-child{border-bottom-left-radius:5px;border-bottom-right-radius:5px}svg{margin-right:10px}main{border:#ccc 1px solid}main img{margin-right:10px}main a{padding:12px 15px;border-bottom:#ddd 1px solid;transition:all .3s}main a:last-child{border:0}main a:hover{background:#fafafa}main a>div{margin-left:10px}main a>div:first-child{flex:1;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center}main a>div:not(:first-child){color:#ccc;font-size:13px}footer{text-align:center;color:#999;font-size:13px}footer a:hover{text-decoration:underline}@media (max-width:640px){main a>div:last-child{display:none}}</style>
</head>
<body>
  <h3><a href="/"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="30" height="30"><path d="M366 160l-9 15-256 416-10 16 9 17 128 224 9 16h550l9-16 128-224 9-17-10-16-256-416-9-15zm75 64h181l217 352H658zm-57 29l95 155-222 361-92-161zm133 216l66 107H451zM412 640h429l-92 160H313z" fill="#00c250"/></svg>Google Drive</a></h3>
  <main>{{content}}</main>
  <footer>Developed by <a target="_blank" href="https://github.com/metadream/serverless">Metadream on Github</a></footer>
</body>
</html>`

/*
 * ----------------------------------------------
 * Utils for renderring page
 * ----------------------------------------------
 */
function render(data) {
  const frag = []
  data && data.forEach(entry => {
    if (entry.mimeType == GoogleDrive.folderType) {
      frag.push(`<a href="${entry.name}/">`)
      frag.push(`<div><img src="${entry.iconLink}"/><b>${entry.name}</b></div>`)
      frag.push(`<div>${formatDate(entry.modifiedTime)}</div>`)
      frag.push('</a>')
    } else {
      frag.push(`<a href="${entry.name}" target="_blank">`)
      frag.push(`<div><img src="${entry.iconLink}"/>${entry.name}</div>`)
      frag.push(`<div>${formatSize(entry.size)}</div>`)
      frag.push(`<div>${formatDate(entry.modifiedTime)}</div>`)
      frag.push('</a>')
    }
  })
  return tpl.trim().replace(/{{content}}/, frag.join(''))
}

function formatSize(n) {
  n = Math.round(n)
  if (n == 0) return ''
  if (n < 1024) return n + 'B'
  if (n < 1024 * 1024) return Math.round(n / 1024) + 'K'
  return parseFloat((n / 1024 / 1024).toFixed(1)) + 'M'
}

function formatDate(v) {
  return v.replace('T', ' ').substr(0, 19)
}

/*
 * ----------------------------------------------
 * Google drive main class
 * ----------------------------------------------
 */
class GoogleDrive {
  constructor(config) {
    this.config = config
    GoogleDrive.authApi = 'https://www.googleapis.com/oauth2/v4/token'
    GoogleDrive.driveApi = 'https://www.googleapis.com/drive/v3/files'
    GoogleDrive.folderType = 'application/vnd.google-apps.folder'
    GoogleDrive.fileAttrs = 'id, name, mimeType, size, modifiedTime, description, iconLink, thumbnailLink, imageMediaMetadata'
    GoogleDrive.metaCache = {
      '/': {
        id: config.root_id || 'root',
        mimeType: GoogleDrive.folderType
      }
    }
  }

  async getMetadata(path) {
    path = path.startsWith('/') ? path : '/' + path
    path = path.endsWith('/') ? path : path + '/'

    if (!GoogleDrive.metaCache[path]) {
      let fullpath = '/'
      let metadata = GoogleDrive.metaCache[fullpath]
      const fragments = this._trim(path, '/').split('/')

      for (let name of fragments) {
        fullpath += name + '/'

        if (!GoogleDrive.metaCache[fullpath]) {
          name = decodeURIComponent(name).replace(/\'/g, "\\'")
          const result = await this._queryDrive({
            q: `'${metadata.id}' in parents and name = '${name}' and trashed = false`,
            fields: `files(${GoogleDrive.fileAttrs})`,
          })
          GoogleDrive.metaCache[fullpath] = result.files[0]
        }
        metadata = GoogleDrive.metaCache[fullpath]
        if (!metadata) break
      }
    }
    return GoogleDrive.metaCache[path]
  }

  async getObjects(id) {
    let pageToken
    const list = []
    const params = {
      pageSize: 1000,
      q: `'${id}' in parents and trashed = false AND name != '.password'`,
      fields: `nextPageToken, files(${GoogleDrive.fileAttrs})`,
      orderBy: 'folder, name'
    }

    do {
      if (pageToken) params.pageToken = pageToken
      const result = await this._queryDrive(params)
      pageToken = result.nextPageToken
      list.push(...result.files)
    } while (
      pageToken
    )
    return list
  }

  async getRawContent(id, range) {
    const response = await fetch(GoogleDrive.driveApi + '/' + id + '?alt=media', {
      headers: {
        Range: range || '',
        Authorization: 'Bearer ' + (await this._getAccessToken())
      }
    })
    if (response.status < 400) {
      return response
    }
    const result = await response.json()
    const error = new Error(result.error.message)
    error.status = response.status
    throw error
  }

  async _queryDrive(params) {
    const driveUrl = GoogleDrive.driveApi + '?' + this._encodeQueryString(params)
    const response = await fetch(driveUrl, {
      headers: {
        Authorization: 'Bearer ' + (await this._getAccessToken())
      }
    })
    const result = await response.json()
    if (result.error) {
      if (result.error.message.startsWith('User Rate Limit Exceeded')) {
        return this._queryDrive(params)
      }
      const error = new Error(result.error.message)
      error.status = response.status
      throw error
    }
    return result
  }

  async _getAccessToken() {
    if (this.config.expires && this.config.expires > Date.now()) {
      return this.config.access_token
    }
    const response = await fetch(GoogleDrive.authApi, {
      method: 'POST',
      body: this._encodeQueryString({
        client_id: this.config.client_id,
        client_secret: this.config.client_secret,
        refresh_token: this.config.refresh_token,
        grant_type: 'refresh_token'
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    const result = await response.json()
    if (result.error) {
      const error = new Error(result.error_description)
      error.status = response.status
      throw error
    }
    this.config.expires = Date.now() + 3500 * 1000
    this.config.access_token = result.access_token
    return this.config.access_token
  }

  _encodeQueryString(data) {
    const result = []
    for (const k in data) {
      result.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    }
    return result.join('&')
  }

  _trim(string, char) {
    return char ?
      string.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '') :
      string.replace(/^\s+|\s+$/g, '')
  }
}

/*
 * ----------------------------------------------
 * Cloudflare worker entry
 * ----------------------------------------------
 */
const gd = new GoogleDrive(config)
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    const url = new URL(request.url)
    url.pathname = url.pathname.replace(/(.+)(=s\d+)$/, function (_, p1, p2) {
      url.param = p2
      return p1
    })

    const metadata = await gd.getMetadata(url.pathname)
    if (!metadata) {
      return new Response(`404: Path '${url.pathname}' not found.`, {
        status: 404
      })
    }

    // Folder response
    if (metadata.mimeType == GoogleDrive.folderType) {
      const objects = await gd.getObjects(metadata.id)
      // JSON format
      if (request.method === 'POST') {
        return new Response(JSON.stringify(objects))
      }
      // HTML format
      return new Response(render(objects), {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      })
    }

    // Image file response
    if (metadata.mimeType.startsWith('image/')) {
      // tempLink expires after one hour
      const tempLink = metadata.thumbnailLink.replace(/=s\d+$/, '')
      url.param = url.param || '=s0' // thumbnail or original
      return await fetch(new Request(tempLink + url.param, request))
    }

    // Other file response
    const range = request.headers.get('Range')
    const object = await gd.getRawContent(metadata.id, range)
    const response = new Response(object.body, object)
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Content-Type', metadata.mimeType)
    response.headers.set('Last-Modified', new Date(metadata.modifiedTime).toGMTString())
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
    response.headers.delete('Content-Disposition')
    return response

  } catch (e) {
    const status = e.code || 500
    return new Response(status + ': ' + e.message, {
      status
    })
  }
}