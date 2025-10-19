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
import assert from "assert";

import oidcRenderer from "../renderers/oidc.renderer.js";
import provider from "../helpers/oidc/provider.js";
import sharedRenderer from "../renderers/shared.renderer.js";
import { UnexpectedClientError } from "../models/errors.js";

/**
 * @typedef {import("express").Request} Request
 * Represents an HTTP request in Express.
 */

/**
 * @typedef {import("express").Response} Response
 * Represents an HTTP response in Express.
 */

export default {
    /**
     * @description Controller for handling OIDC interaction pages.
     * This function retrieves interaction details and renders the appropriate page
     * based on the type of prompt (login or consent).
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    interaction: async (req, res) => {
        // Retrieve interaction details from the OIDC provider
        const interactionDetails = await provider.interactionDetails(req, res);
        const { uid, prompt, params } = interactionDetails;

        // Handle different types of prompts
        switch (prompt.name) {
            case 'login': {
                // Render the login page if the prompt is for login
                return sharedRenderer.login(res, interactionDetails);
            }
            case 'consent': {
                // Render the consent page if the prompt is for consent
                return oidcRenderer.consent(req, res, uid, params.clientId);
            }
            default:
                // If the prompt type is not recognized, return throw an error
                throw new UnexpectedClientError(res.__("validation.prompt.invalid"));

        }
    },

    /**
     * @description Controller for handling OIDC confirm POST requests.
     * This function processes the consent confirmation and updates the grant
     * with the necessary scopes and claims.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    confirmPost: async (req, res) => {
        // Retrieve interaction details from the OIDC provider
        const interactionDetails = await provider.interactionDetails(req, res);
        const { prompt: { name, details }, params, session: { accountId } } = interactionDetails;

        // Ensure that the prompt is for consent
        assert.equal(name, 'consent');

        let { grantId } = interactionDetails;
        let grant;

        // If a grant ID exists, retrieve the existing grant; otherwise, create a new one
        if (grantId) {
            grant = await provider.Grant.find(grantId);
        } else {
            grant = new provider.Grant({
                accountId,
                clientId: params.client_id,
            });
        }

        // Add any missing OIDC scopes to the grant
        if (details.missingOIDCScope) {
            grant.addOIDCScope(details.missingOIDCScope.join(' '));
        }
        // Add any missing OIDC claims to the grant
        if (details.missingOIDCClaims) {
            grant.addOIDCClaims(details.missingOIDCClaims);
        }
        // Add any missing resource scopes to the grant
        if (details.missingResourceScopes) {
            for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
                grant.addResourceScope(indicator, scopes.join(' '));
            }
        }

        // Save the grant and retrieve the grant ID
        grantId = await grant.save();

        const consent = {};
        // If there was no previous grant ID, set the new grant ID in the consent object
        if (!interactionDetails.grantId) {
            consent.grantId = grantId;
        }

        // Prepare the result object to finish the interaction
        const result = { consent };
        // Finish the interaction and merge with the last submission
        await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
    },

    /**
     * @description Controller for handling OIDC abort GET requests.
     * This function handles the scenario where the user aborts the interaction,
     * returning an error response indicating access was denied.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    abort: async (req, res) => {
        // Prepare the result object indicating the interaction was aborted
        const result = {
            error: 'access_denied',
            error_description: 'End-User aborted interaction',
        };
        // Finish the interaction with the abort result
        await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    },
};
