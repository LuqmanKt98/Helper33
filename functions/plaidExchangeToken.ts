import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Configuration, PlaidApi, PlaidEnvironments } from 'npm:plaid@29.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { public_token } = await req.json();

    if (!public_token) {
      return Response.json({ error: 'Public token required' }, { status: 400 });
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

    // Exchange public token for access token
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const access_token = tokenResponse.data.access_token;
    const item_id = tokenResponse.data.item_id;

    // Get account information
    const accountsResponse = await plaidClient.accountsGet({
      access_token,
    });

    const accounts = accountsResponse.data.accounts;
    const institution = accountsResponse.data.item.institution_id;

    // Get institution details
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institution,
      country_codes: ['US', 'CA', 'GB'],
    });

    const institutionName = institutionResponse.data.institution.name;

    // Create bank connections for each account
    const connections = [];
    for (const account of accounts) {
      const connection = await base44.asServiceRole.entities.BankConnection.create({
        bank_name: institutionName,
        account_type: account.subtype || account.type,
        last_4_digits: account.mask || '0000',
        connection_status: 'connected',
        last_synced: new Date().toISOString(),
        plaid_access_token: access_token,
        plaid_account_id: account.account_id,
        plaid_item_id: item_id,
        balance: account.balances.current || account.balances.available || 0,
        currency: account.balances.iso_currency_code || 'USD',
        created_by: user.email
      });
      connections.push(connection);
    }

    return Response.json({ 
      success: true,
      connections,
      message: `Successfully connected ${accounts.length} account(s) from ${institutionName}`
    });
  } catch (error) {
    console.error('Plaid exchange token error:', error);
    return Response.json({ 
      error: 'Failed to connect bank account',
      details: error.message 
    }, { status: 500 });
  }
});