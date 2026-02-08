import { supabase } from '@/lib/supabaseClient';

export const base44 = {
    auth: {
        me: async () => {
            const { data } = await supabase.auth.getUser();
            return data?.user || null;
        },
        logout: async () => {
            await supabase.auth.signOut();
        },
        redirectToLogin: () => { window.location.href = '/login'; }
    },
    appLogs: {
        logUserInApp: async (pageName) => { }
    },
    entities: {
        Query: {}
    },
    agents: {
        getWhatsAppConnectURL: (agentId) => `https://wa.me/?text=${encodeURIComponent(`Connect with ${agentId} agent`)}`,
        subscribeToConversation: (conversationId, callback) => {
            // Return an unsubscribe function stub
            return () => { };
        }
    },
    integrations: {
        Core: {}
    },
    functions: {
        invoke: async (functionName, payload) => ({ data: null })
    }
};
