import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Using the Frankfurter.app API - it's free and requires no API key.
const API_URL = "https://api.frankfurter.app/latest";

Deno.serve(async (req) => {
  try {
    // Authenticate the user request
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { baseCurrency, targetCurrency } = await req.json();

    if (!baseCurrency || !targetCurrency) {
      return Response.json(
        { error: "Both baseCurrency and targetCurrency are required." },
        { status: 400 }
      );
    }
    
    // Construct the URL for the new API
    const response = await fetch(`${API_URL}?from=${baseCurrency}&to=${targetCurrency}`);
    const data = await response.json();

    if (!response.ok) {
      console.error("Frankfurter API Error:", data.message);
      return Response.json(
        { error: 'Failed to fetch exchange rate from the provider.', details: data.message },
        { status: response.status }
      );
    }

    // Extract the rate from the new API's response structure
    const conversionRate = data.rates?.[targetCurrency];

    if (conversionRate === undefined) {
        return Response.json({ error: `The target currency "${targetCurrency}" is not supported by the provider.` }, { status: 400 });
    }

    return Response.json({ conversion_rate: conversionRate });

  } catch (error) {
    console.error("Server Error in getExchangeRate function:", error.message);
    return Response.json({ error: "An unexpected error occurred on the server." }, { status: 500 });
  }
});