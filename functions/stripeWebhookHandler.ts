import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
      apiVersion: '2024-12-18.acacia'
    });

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      return Response.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    const body = await req.text();
    
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    console.log('Webhook event type:', event.type);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerId = session.customer;
      const metadata = session.metadata || {};
      
      // Handle book purchases
      if (metadata.product_type === 'book' && metadata.user_field_to_update) {
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
        const user = users?.[0];
        
        if (user) {
          const updateData = {
            [metadata.user_field_to_update]: true
          };
          
          await base44.asServiceRole.entities.User.update(user.id, updateData);
          
          console.log(`Granted book access: ${metadata.book_id} to user ${user.id}`);
          
          // Send confirmation email
          const bookTitles = {
            'infinity': 'Infinity Book by Ruby Dobry',
            'things_they_took': 'The Things They Took: The Love That Stayed by Ruby Dobry'
          };
          
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: user.email,
            subject: `Your Book is Ready: ${bookTitles[metadata.book_id]}`,
            body: `
Hi ${user.full_name},

Thank you for your purchase! Your book is now available in your library.

Book: ${bookTitles[metadata.book_id]}

You can access it anytime from the Book Studio.

Enjoy your reading journey!

With love,
The Helper33 Team
            `
          });
        }
      }
      
      // Handle marketplace orders
      const orderNumber = session.metadata?.order_number;
      
      if (orderNumber) {
        const orders = await base44.asServiceRole.entities.MarketplaceOrder.filter({ order_number: orderNumber });
        const order = orders[0];

        if (order) {
          // Update order status
          await base44.asServiceRole.entities.MarketplaceOrder.update(order.id, {
            payment_status: 'held_in_escrow',
            order_status: 'confirmed',
            stripe_payment_intent_id: session.payment_intent
          });

          // For digital products, grant instant access
          for (const item of order.items) {
            if (item.item_type === 'product') {
              const products = await base44.asServiceRole.entities.MarketplaceProduct.filter({ id: item.item_id });
              const product = products[0];
              
              // If digital product, send download links immediately
              if (product && product.product_type === 'digital_download' && product.digital_files?.length > 0) {
                const downloadLinks = product.digital_files.map(f => 
                  `${f.filename}: ${f.file_url}`
                ).join('\n\n');

                await base44.asServiceRole.integrations.Core.SendEmail({
                  to: order.buyer_email,
                  subject: `Your Digital Download: ${product.product_name}`,
                  body: `
Hi ${order.buyer_name},

Thank you for your purchase! Your digital product is ready for download.

Product: ${product.product_name}

Download Links:
${downloadLinks}

These links will remain active in your account at Helper33 Marketplace.

Questions? Reply to this email or contact ${order.seller_name}.

Enjoy!
Helper33 Marketplace Team
                  `
                });
              }
            } else if (item.item_type === 'course') {
              // Grant course access
              const enrollments = await base44.asServiceRole.entities.CourseEnrollment.filter({
                course_id: item.item_id,
                student_email: order.buyer_email
              });

              if (enrollments.length === 0) {
                await base44.asServiceRole.entities.CourseEnrollment.create({
                  course_id: item.item_id,
                  course_title: item.item_name,
                  student_email: order.buyer_email,
                  student_name: order.buyer_name,
                  order_id: order.id,
                  enrollment_date: new Date().toISOString(),
                  access_granted: true
                });
              } else {
                await base44.asServiceRole.entities.CourseEnrollment.update(enrollments[0].id, {
                  access_granted: true
                });
              }
            }
          }

          // Send confirmation email
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: order.buyer_email,
            subject: `Order Confirmed: ${order.order_number}`,
            body: `
Hi ${order.buyer_name},

Your order has been confirmed!

Order Number: ${order.order_number}
Total: $${order.total_amount.toFixed(2)}

${order.items.map(item => `- ${item.item_name} (x${item.quantity})`).join('\n')}

Digital products have been delivered to your email. Course access is now active in your account.

Thank you for shopping at Helper33 Marketplace!

Best,
Helper33 Team
            `
          });

          // Notify seller
          const sellerProfiles = await base44.asServiceRole.entities.SellerProfile.filter({ id: order.seller_id });
          if (sellerProfiles[0]?.contact_email) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: sellerProfiles[0].contact_email,
              subject: `New Sale: ${order.order_number}`,
              body: `
Great news! You made a sale!

Order: ${order.order_number}
Buyer: ${order.buyer_name}
Items: ${order.items.map(i => i.item_name).join(', ')}
Your Payout: $${order.seller_payout.toFixed(2)}

Funds will be released after the escrow period.

View details in your Seller Dashboard.

Congratulations!
Helper33 Marketplace
              `
            });
          }
        }
      }
    }

    // Handle subscription creation
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
      const user = users?.[0];

      if (user) {
        const tier = subscription.metadata?.tier || 'pro';
        const planType = subscription.metadata?.plan_type;
        
        const updateData = {
          subscription_status: 'active',
          stripe_subscription_id: subscription.id,
          subscription_tier: tier,
          plan_type: planType,
          subscription_start_date: new Date().toISOString()
        };
        
        // Set access based on tier
        if (tier === 'basic') {
          updateData.basic_access = true;
        } else if (tier === 'pro') {
          updateData.basic_access = true;
          updateData.pro_access = true;
        } else if (tier === 'executive') {
          updateData.basic_access = true;
          updateData.pro_access = true;
          updateData.executive_access = true;
          updateData.infinity_book_purchased = true;
          updateData.things_they_took_purchased = true;
        }
        
        await base44.asServiceRole.entities.User.update(user.id, updateData);
        
        // Tier-specific welcome messages
        const tierNames = { basic: 'Basic', pro: 'Pro', executive: 'Executive' };
        const tierFeatures = {
          basic: 'Life Coach AI, Journal Studio, Vision Board, and all planning tools',
          pro: 'Everything in Basic plus Family Hub, Meal Planner, Homework Hub, and SoulLink companion',
          executive: 'Full access to ALL features including AI Agents, Practitioner tools, Social Media Manager, and exclusive content'
        };
        
        // Send welcome email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `Welcome to Helper33 ${tierNames[tier]}! 🎉`,
          body: `
            <h2>Thank you for subscribing to Helper33 ${tierNames[tier]}!</h2>
            <p>Hi ${user.full_name},</p>
            <p>Your ${tierNames[tier]} subscription is now active! You now have access to:</p>
            <p><strong>${tierFeatures[tier]}</strong></p>
            <p>Start exploring your new features from your Dashboard.</p>
            <p>Enjoy your enhanced Helper33 experience!</p>
            <p>Best regards,<br/>The Helper33 Team</p>
          `
        });
        
        console.log(`Subscription created: ${tier} for user ${user.id}`);
      }
    }

    // Handle subscription updates
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
      const user = users?.[0];

      if (user) {
        const status = subscription.status === 'active' ? 'active' : subscription.status;
        await base44.asServiceRole.entities.User.update(user.id, {
          subscription_status: status,
          stripe_subscription_id: subscription.id
        });
        console.log(`Updated subscription status for user ${user.id}: ${status}`);
      }
    }

    // Handle subscription deletions/cancellations
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
      const user = users?.[0];

      if (user) {
        await base44.asServiceRole.entities.User.update(user.id, {
          subscription_status: 'cancelled',
          subscription_tier: 'free',
          stripe_subscription_id: null,
          basic_access: false,
          pro_access: false,
          executive_access: false
        });
        
        // Send cancellation email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: 'Subscription Cancelled',
          body: `
            <h2>Your subscription has been cancelled</h2>
            <p>Hi ${user.full_name},</p>
            <p>We're sorry to see you go. Your subscription has been cancelled and you've been moved to the free tier.</p>
            <p>You can resubscribe anytime from your Account Manager.</p>
            <p>Thank you for being part of Helper33!</p>
          `
        });
        
        console.log(`Cancelled subscription for user ${user.id}`);
      }
    }

    // Handle successful one-time payments
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const customerId = paymentIntent.customer;

      if (customerId) {
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
        const user = users?.[0];

        if (user && paymentIntent.metadata) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: user.email,
            subject: 'Payment Successful! 🎉',
            body: `
              <h2>Payment Confirmed</h2>
              <p>Hi ${user.full_name},</p>
              <p>Your payment of $${(paymentIntent.amount / 100).toFixed(2)} has been processed successfully.</p>
              <p>Thank you for your purchase!</p>
              <p>Best regards,<br/>The Helper33 Team</p>
            `
          });
        }
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});