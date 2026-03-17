export const requestWithFormData = (request, endpoint, data) => {
	return request
		.post(endpoint)
		.set('Content-Type', 'application/x-www-form-urlencoded')
		.send(new URLSearchParams(data).toString());
};
