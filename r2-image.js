/**
 * Cloudflare Service Integration
 * Transform Images in R2 with Workers
 */
export default {

    async fetch(request, env) {
        const { origin, pathname, searchParams } = new URL(request.url);
        if (pathname === "/") {
            return new Response("(c) 2024 Object Storage Service based on Cloudflare R2");
        }

        // Get bucket
        const { bucketName, objectKey } = this.parse(pathname);
        const bucket = env[bucketName];
        if (!bucket) {
            return new Response("Bucket Not Found", { status: 404 });
        }

        // Get object
        const object = await bucket.get(objectKey);
        if (!object) {
            return new Response("Object Not Found", { status: 404 });
        }

        // If not image or has no querystring, return the raw content
        const { contentType } = object.httpMetadata;
        if (!contentType.startsWith("image/") || !searchParams.toString()) {
            // HTTP caching
            const etag = this.extractEtag(request);
            if (etag == object.httpEtag) {
                return new Response(null, { status: 304 });
            }
            // Raw content
            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set("Access-Control-Allow-Origin", "*");
            headers.set("Access-Control-Allow-Headers", "*");
            headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
            headers.set("etag", object.httpEtag);
            return new Response(object.body, { headers });
        }

        // If image, transform with query parameters
        const image = { fit: "scale-down" };
        if (searchParams.has("size")) {
            image.width = image.height = searchParams.get("size");
        }
        if (searchParams.has("width")) image.width = searchParams.get("width");
        if (searchParams.has("height")) image.height = searchParams.get("height");
        if (searchParams.has("quality")) image.quality = searchParams.get("quality");
        if (searchParams.has("fit")) image.fit = searchParams.get("fit");

        return fetch(new Request(origin + pathname,
            { headers: request.headers }),  { cf: { image } });
    },

    parse(pathname) {
        const parts = pathname.slice(1).split("/");
        return {
            bucketName: parts.shift(),
            objectKey: decodeURI(parts.join("/"))
        };
    },

    extractEtag(request) {
        const etag = request.headers.get("If-None-Match");
        if (etag) {
            const matched = etag.match(/W\/("\w+")/);
            return matched ? matched[1] : etag;
        }
        return null;
    }
}
