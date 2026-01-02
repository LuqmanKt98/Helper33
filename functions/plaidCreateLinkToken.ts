import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Configuration, PlaidApi, PlaidEnvironments, Products } from 'npm:plaid@29.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plaidClient = new PlaidApi(
      new Configuration({
        basePath: PlaidEnvironments[Deno.env.get('PLAID_ENV') || 'sandbox'],
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID'),
            'PLAID-SECRET': Deno.env.get('PLAID_SECRET'),
          },
        },
      })
    );

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id || user.email,
      },
      client_name: 'Helper33 Finance Tracker',
      products: [Products.Transactions, Products.Auth],
      country_codes: ['US', 'CA', 'GB'],
      language: 'en',
      redirect_uri: null,
    });

    return Response.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Plaid link token error:', error);
    return Response.json({ 
      error: 'Failed to create link token',
      details: error.message 
    }, { status: 500 });
  }
});