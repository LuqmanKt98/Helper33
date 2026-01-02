import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Helper function to generate Google search URLs
const createSearchUrl = (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}`;

// Pre-defined search terms for different resource types
const resourceSearchTerms = {
    'lawyer': {
        'Probate Lawyer': 'probate lawyer in',
        'State Bar Association': 'state bar association for',
    },
    'funeral_home': {
        'Funeral Homes': 'funeral homes in',
        'State Funeral Board': 'state funeral regulatory board for',
    },
    'financial_advisor': {
        'Financial Advisors for Estates': 'financial advisors for estate settlement in',
        'CFP Board Verification': 'CFP board verify credential',
    },
    'therapist': {
        'Grief Counselors': 'grief counselors in',
        'State Licensing Board': 'state board of psychology for',
    },
    'legal_aid': {
        'Legal Aid Society': 'legal aid society in',
    },
    'consumer_protection': {
        'Consumer Protection Agency': 'consumer protection agency in',
        'FTC Complaint Assistant': 'ftc complaint assistant',
    }
};

Deno.serve(async (req) => {
    try {
        // This endpoint can be public, so no need for strict authentication
        const { zipCode, resourceType } = await req.json();

        if (!zipCode || !resourceType) {
            return new Response(JSON.stringify({ error: 'zipCode and resourceType are required' }), { status: 400 });
        }

        const terms = resourceSearchTerms[resourceType];
        if (!terms) {
            return new Response(JSON.stringify({ error: 'Invalid resourceType' }), { status: 400 });
        }

        const searchResults = Object.entries(terms).map(([title, query]) => {
            const fullQuery = `${query} ${zipCode}`;
            return {
                title: title,
                url: createSearchUrl(fullQuery),
                description: `Search for '${title}' near zip code ${zipCode}.`
            };
        });
        
        // Add a general fallback search
        searchResults.push({
            title: `General Search for ${resourceType.replace(/_/g, ' ')}`,
            url: createSearchUrl(`${resourceType.replace(/_/g, ' ')} near ${zipCode}`),
            description: `A broad web search for this resource type.`
        });

        return new Response(JSON.stringify({ results: searchResults }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Error in findLocalResources:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
});