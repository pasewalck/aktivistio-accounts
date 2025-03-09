/**
 * @description Creates a localization function for validation messages.
 * @param {string} message - The message key to be localized.
 * @param {...*} params - Additional parameters to be passed to the localization function.
 * @returns {function} A middleware function that returns the localized message.
 */
export default (message, ...params) => {
    return (value, { req, location, path }) => {
        // Return the localized message using the provided message key and parameters
        return req.__(message, ...params);
    };
};
