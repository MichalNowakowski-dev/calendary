import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature, processWebhookEvent, StripeWebhookError } from '@/lib/stripe/webhooks';
import { STRIPE_ERRORS } from '@/lib/stripe/config';

export async function POST(req: NextRequest) {
  try {
    // Get the raw body and signature
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify the webhook signature and construct the event
    let event;
    try {
      event = await verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: STRIPE_ERRORS.INVALID_SIGNATURE },
        { status: 400 }
      );
    }

    console.log(`Processing webhook event: ${event.type} (${event.id})`);

    // Process the webhook event
    try {
      await processWebhookEvent(event);
      console.log(`Successfully processed webhook event: ${event.id}`);
      
      return NextResponse.json(
        { 
          received: true,
          event_id: event.id,
          event_type: event.type
        },
        { status: 200 }
      );
    } catch (error) {
      console.error(`Error processing webhook event ${event.id}:`, error);
      
      if (error instanceof StripeWebhookError) {
        // Log the error but return 200 to prevent Stripe retries for business logic errors
        return NextResponse.json(
          { 
            received: true,
            event_id: event.id,
            event_type: event.type,
            error: error.message
          },
          { status: 200 }
        );
      }
      
      // For other errors, return 500 so Stripe will retry
      return NextResponse.json(
        { 
          error: 'Internal server error',
          event_id: event.id,
          event_type: event.type
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Webhook handler error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}