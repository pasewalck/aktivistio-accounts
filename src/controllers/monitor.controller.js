import monitorService from '../services/monitor.service.js';

/**
 * @description Controller for the monitor API.
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 */
function status(req, res) {
	res.json(monitorService.getStatus());
}

export default {
	status,
};
