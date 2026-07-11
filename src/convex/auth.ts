import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // No verify or reset config = no email verification required
      // The profile callback lets us normalize the username input
      profile(params) {
        return {
          email: params.email as string,
        };
      },
    }),
    Anonymous,
  ],
});