import accountDriver from "../drivers/account.driver.js";

export default async function findAccount(ctx, id) {
    const account = accountDriver.findAccountWithId(id);
    return (
        {
          accountId: id,
          claims(use, scope) {
  
            const openid = { sub: id };
            const email = {
              email: account.username + "@placeholder.mail",          
            };
            const profile = {
              name: account.username,
            };
  
            return {
              ...(scope.includes("openid") && openid),
              ...(scope.includes("email") && email),
              ...(scope.includes("profile") && profile),
            };
          },
        }
      );
}