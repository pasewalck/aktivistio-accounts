import accountService from "../../services/account.service.js";

export default async function findAccount(ctx, id) {
    const account = accountService.find.withId(id);
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