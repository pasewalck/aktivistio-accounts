import ejs from 'ejs';
import fs from 'fs';

/**
 * @description render template file
 * @param {String} [path]
 * @param {JSON} [data]
 * @returns {String}
 */
export const renderTemplate = (path,data) => {
    var file = fs.readFileSync(path, 'ascii')
    return ejs.render(file,data);
}