import env from "./env.js"

/**
 * @description Appends one or more relative paths to a base URL and returns the resulting URL.
 * @param {URL} baseURL - The base URL to which the relative paths will be appended.
 * @param  {...String} relativePaths - One or more relative paths to append to the base URL.
 * @returns {URL} The resulting URL.
 */
export function appendToBaseUrl(baseURL, ...relativePaths) { 
    return createURL(baseURL.href, ...relativePaths);
}

/**
 * @description Creates a new URL by joining multiple segments, ensuring that there are no leading or trailing slashes.
 * Sourced idea from the following implementation https://github.com/axios/axios/blob/fe7d09bb08fa1c0e414956b7fc760c80459b0a43/lib/helpers/combineURLs.js
 * @param  {...String} segments - The segments to be combined into a single URL.
 * @returns {URL} The resulting URL.
 */
export function createURL(...segments) {
    return new URL(segments.map(segment => segment.replace(/\/+$/, '').replace(/^\/+/, '')).join('/'));
}
