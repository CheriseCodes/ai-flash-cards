import { auth } from "express-oauth2-jwt-bearer";

let authSetup = auth({
  audience: "http://localhost:8000",
  issuerBaseURL: "https://dev-akcpb5t2powmgxer.us.auth0.com/",
  tokenSigningAlg: "RS256",
});

if (process.env.NODE_ENV && process.env.NODE_ENV.includes("test")) {
  authSetup = (req, res, next) => {
    console.log("Auth middleware executed");
    next();
  };
}

export const jwtCheck = authSetup;
