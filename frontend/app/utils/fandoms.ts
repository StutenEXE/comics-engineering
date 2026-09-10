
function getTitleFromFandomUrl(url: string) {
    return decodeURIComponent(url.split("/wiki/")[1]);
}

export function getHostFromFandomUrl(url: string) {
    // https://[xxx.fandom.com]/wiki/xxxxxxx
    return url.split("/")[2];
}

export async function getImgUrlFromFandomUrl(fUrl: string) {
    const host = getHostFromFandomUrl(fUrl);
    const title = getTitleFromFandomUrl(fUrl);

    const url =
        `https://${host}/api.php?action=query` +
        `&titles=${encodeURIComponent(title)}` +
        `&prop=pageimages` +
        `&piprop=original` +
        `&format=json` +
        `&origin=*`;

    const res = await fetch(url);
    const data = await res.json();

    const page: any = Object.values(data.query.pages)[0];
    return page.original?.source ?? null;
}