import ejs from 'ejs';
import path from 'path';

/**
 * @description render template file
 * @param {String} [path]
 * @param {JSON} [data]
 * @returns {String}
 */
export const renderTemplate = async (renderPath,data) => {
    return await ejs.renderFile(renderPath,data);
}

export async function emulatedEjs (layout="/layouts/main",viewsPath=path.join("./src", 'views')) {
    layout = layout.endsWith(".ejs") ? layout : `${layout}.ejs`
    return {
        render: async (renderPath,data) => {
            renderPath = renderPath.endsWith(".ejs") ? renderPath : `${renderPath}.ejs`
            const layoutTemplate = path.join(viewsPath, layout);
            const viewTemplate = path.join(viewsPath, renderPath);
            return await renderTemplate(layoutTemplate,{...data,body:await renderTemplate(viewTemplate,data)})
        }
    }
}



