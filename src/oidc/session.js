// Sourced from https://gist.github.com/wilsonjackson/9136b0bee9d47080bcbee991378b2581
//
// This is a replacement for the method Provider.setProviderSession, which was removed in oidc-provider 7.x.
//
// Question in repo about its removal, unanswered at the time of this writing:
// https://github.com/panva/node-oidc-provider/discussions/934
//
// Original 6.x Method source is here:
// https://github.com/panva/node-oidc-provider/blob/2c3a667de583846470921883918f4c4145bef6c6/lib/provider.js
//
// The version in this file has been adjusted in the following significant ways:
// - Removed the `meta` argument, which is no longer supported in 7.x
// - Now creates a Grant record, which is a new entity type in 7.x
// - Uses Session.loginAccount() instead of Object.assign() to assign session properties
// - Discovers the session TTL by reading OIDC Provider configuration, as it's a required argument to Session.save()
//
// oidc-provider internals are used here, so this could very easily break in an upgrade.

import instance from 'oidc-provider/lib/helpers/weak_cache.js';
import epochTime from 'oidc-provider/lib/helpers/epoch_time.js';
import {get,set} from 'oidc-provider/lib/helpers/samesite_handler.js';
import nanoid from 'oidc-provider/lib/helpers/nanoid.js';

import assert from "assert"

/**
* @name setProviderSession
* @api public
*/
export async function setProviderSession(provider, req, res, {
  accountId,
  loginTs = epochTime(),
  remember = true,
  clients = [],
} = {}) {
  assert(typeof accountId === 'string', 'accountId must be a string');
  assert(Number.isSafeInteger(loginTs), 'loginTs must be an Integer');
  assert(Array.isArray(clients), 'clients must be an Array');

  const ctx = {
    req,
    res,
    oidc: {
      provider,
      cookies: provider.app.createContext(req,res).cookies,
    },
    secure: req.connection.encrypted || req.protocol === 'https',
  };

  const session = await provider.Session.get(ctx);
  session.loginAccount({ accountId, loginTs, transient: !remember });

  for (const clientId of clients) {
    assert(typeof clientId === 'string', 'clients must contain an array of client_id strings');
    const grant = new provider.Grant({ accountId, clientId });
    grant.addOIDCScope('openid');
    const grantId = await grant.save();
    session.sidFor(clientId, nanoid());
    session.grantIdFor(clientId, grantId);
  }

  let ttl = instance(provider).configuration('ttl.Session');
  if (typeof ttl === 'function') {
    ttl = ttl(ctx, session);
  }
  await session.save(ttl);

  const { maxAge, ...opts } = instance(provider).configuration('cookies.long');

  set(
    ctx.oidc.cookies,
    provider.cookieName('session'),
    session.id,
    session.transient ? opts : { maxAge, ...opts },
  );

  return session;
}

