import { Auth0Client } from "@auth0/nextjs-auth0/server";

const audiwnceUrl = process.env.AUTH0_AUDIENCE;

export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: audiwnceUrl,
    scope: "openid profile email",
  },
  session: {
    rolling: true,
    absoluteDuration: 3600,
    cookie: {
      sameSite: "none",
      secure: true, // REQUIRED when sameSite = none
    },
  },
});

