import sgMail from 'npm:@sendgrid/mail@8.1.1';

// Initialize SendGrid
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

Deno.serve(async (req) => {
  try {
    // Security Check: Verify secret key from URL query parameter
    const url = new URL(req.url);
    const secret = url.searchParams.get('key');
    const expectedSecret = Deno.env.get('DONORBOX_WEBHOOK_KEY');

    if (!expectedSecret || secret !== expectedSecret) {
      console.warn('Unauthorized Donorbox webhook attempt.');
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Parse the incoming event payload from Donorbox
    const event = await req.json();
    const donationPayload = event?.payload || {};

    const email = donationPayload.donation?.donor?.email || donationPayload.donor?.email;
    const amount = donationPayload.donation?.amount || donationPayload.amount;
    const currency = (donationPayload.donation?.currency || "USD").toUpperCase();

    // If an email is present in the payload, send a thank-you note
    if (email && SENDGRID_API_KEY) {
      const msg = {
        to: email,
        bcc: Deno.env.get('ARCHIVE_EMAIL'),
        from: {
            email: Deno.env.get('FROM_EMAIL'),
            name: 'DobryLife'
        },
        subject: 'With gratitude — your gift to DobryLife',
        text: `Thank you for supporting DobryLife.\n\nYour donation of ${currency} ${(amount || 0).toFixed?.(2) || amount} helps us build compassionate, AI-driven care and support.\n\nWith gratitude,\nDobryLife — AI for the Human Heart`,
        html: `<p>Thank you for supporting DobryLife.</p><p>Your donation of <strong>${currency} ${(amount || 0).toFixed?.(2) || amount}</strong> helps us build compassionate, AI-driven care and support.</p><p>With gratitude,<br>DobryLife — AI for the Human Heart</p>`,
      };
      await sgMail.send(msg);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (e) {
    console.error("Donorbox webhook error:", e.message);
    return new Response(null, { status: 500 });
  }
});