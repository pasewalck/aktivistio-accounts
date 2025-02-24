export default (message,...params) => {
    return (value, { req, location, path }) => {
        return req.__(message,...params);
    }
}