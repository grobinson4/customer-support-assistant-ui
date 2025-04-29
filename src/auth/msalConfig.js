import { LogLevel } from "@azure/msal-browser";
const redirectUri= import.meta.env.VITE_REDIRECT_URI;
const clientId = import.meta.env.VITE_CLIENT_ID;
const tenantId = import.meta.env.VITE_TENANT_ID;

export const msalConfig = {
    
  auth: {
    clientId: `${clientId}`, // 🔥 Replace with your SPA clientId (not API)
    authority: `https://login.microsoftonline.com/${tenantId}`, // 🔥 Your tenant ID
    redirectUri: `${redirectUri}`, // Your React app local dev URL
    postLogoutRedirectUri: `${redirectUri}`
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
        }
      },
    }
  }
};
