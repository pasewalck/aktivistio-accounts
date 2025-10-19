/* 
 * This file is part of "Aktivistio Accounts".
 *
 * The project "Aktivistio Accounts" implements an account system and 
 * management platform combined with an OAuth 2.0 Authorization Server.
 *
 * "Aktivistio Accounts" is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * "Aktivistio Accounts" is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with "Aktivistio Accounts". If not, see https://www.gnu.org/licenses/.
 *
 * Copyright (C) 2025 Jana
 */

/**
 * @description Appends one or more relative paths to a base URL and returns the resulting URL.
 * @param {URL} baseURL - The base URL to which the relative paths will be appended.
 * @param  {...String} relativePaths - One or more relative paths to append to the base URL.
 * @returns {URL} The resulting URL.
 */
export function extendUrl(baseURL, ...relativePaths) { 
    return assembleUrl(baseURL.href, ...relativePaths);
}

/**
 * @description Creates a new URL by joining multiple segments, ensuring that there are no leading or trailing slashes.
 * Sourced idea from the following implementation https://github.com/axios/axios/blob/fe7d09bb08fa1c0e414956b7fc760c80459b0a43/lib/helpers/combineURLs.js
 * @param  {...String} segments - The segments to be combined into a single URL.
 * @returns {URL} The resulting URL.
 */
export function assembleUrl(...segments) {
    return new URL(segments.map(segment => segment.replace(/\/+$/, '').replace(/^\/+/, '')).join('/'));
}
