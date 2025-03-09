/**
 * @description Executes a series of validation checks on the request.
 * @param {import("express").Request} req - The Express request object.
 * @param {Array} checks - An array of validation check objects that implement a `run` method.
 */
export default (req, checks) => {
    // Iterate over each check and execute it with the request object
    checks.forEach(check => {
        check.run(req);
    });
};
