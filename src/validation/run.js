export default (req,checks) => {
    checks.forEach(check => {
        check.run(req);
    });
}