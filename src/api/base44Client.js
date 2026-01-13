// Base44 client has been removed in favor of Supabase.
// This file is kept as a stub to avoid breaking any accidental imports.
// Please migrate any remaining Base44 usages to the Supabase client in src/lib/supabaseClient.js.

export const base44 = {
    auth: {
        me: async () => null,
        logout: async () => { },
        redirectToLogin: () => { window.location.href = '/login'; }
    },
    appLogs: {
        logUserInApp: async (pageName) => { }
    },
    entities: {
        Query: {}
    },
    integrations: {
        Core: {}
    },
    functions: {
        invoke: async (functionName, payload) => ({ data: null })
    }
};
