export default ({ config }) => {
    return {
        ...config,
        android: {
            ...config.android,
            // EAS provides the path via env (file secret); fall back to the
            // gitignored file in the repo root for local builds.
            googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json"
        },
        ios: {
            ...config.ios,
            googleServicesFile: process.env.GOOGLESERVICE_INFO_PLIST || "./GoogleService-Info.plist"
        },
    };
};