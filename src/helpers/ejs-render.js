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
 * along with "Aktivistio Accounts". If not, see <https://www.gnu.org/licenses/>.
 *
 * Copyright (C) 2025 Jana
 */
import ejs from 'ejs';
import path from 'path';
import logger from './logger.js';

/**
 * @description Renders a file using EJS.
 * @param {String} renderPath - The path to the EJS file.
 * @param {Object} data - The data to be passed to the template for rendering.
 * @returns {Promise<String>} - The rendered template as a string.
 */
export const renderEjsFile = async (renderPath, data) => {
    // Ensure the file has the correct .ejs extension
    renderPath = renderPath.endsWith(".ejs") ? renderPath : `${renderPath}.ejs`;
    try {
        return await ejs.renderFile(renderPath, data);
    } catch (error) {
        logger.error(`Error rendering template at ${renderPath} with error:`, error);
    }
}

/**
 * @description Creates an emulated EJS rendering function that supports layouts.
 * @param {String} layout - The path to the layout file (default is "/layouts/main").
 * @param {String} viewsPath - The base path for the views directory (default is "./src/views").
 * @returns {{render:Function}} - An object containing the render function.
 */
export async function emulatedEjs(layout = "/layouts/main", viewsPath = path.join("./src", 'views')) {
    return {
        /**
         * @description Renders a view template wrapped in the specified layout.
         * @param {String} renderPath - The path to the view template file.
         * @param {Object} data - The data to be passed to both the layout and view templates.
         * @returns {Promise<String>} - Promise for the rendered layout with the view content as string.
         */
        render: async (renderPath, data) => {
            // Construct full paths for the layout and view templates
            const layoutTemplate = path.join(viewsPath, layout);
            const viewTemplate = path.join(viewsPath, renderPath);

            // Render the view template and pass its content to the layout. Render layout and return it
            const viewContent = await renderEjsFile(viewTemplate, data);
            return await renderEjsFile(layoutTemplate, { ...data, body: viewContent });
        }
    }
}
