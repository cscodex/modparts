// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev';

    // Debug mode to check environment variables
    if (type === 'debug') {
      return new Response(
        JSON.stringify({
          success: true,
          debug: {
            hasResendApiKey: !!RESEND_API_KEY,
            resendApiKeyLength: RESEND_API_KEY ? RESEND_API_KEY.length : 0,
            resendApiKeyPrefix: RESEND_API_KEY ? RESEND_API_KEY.substring(0, 5) + '...' : 'not set',
            fromEmail: FROM_EMAIL,
            allEnvVars: Object.keys(Deno.env.toObject())
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required')
    }

    const emailSubject = `Order Confirmation #${data.orderId} - Sardaarji Auto Parts`
    const emailHtml = `
      <h1>🚗 Sardaarji Auto Parts</h1>
      <h2>Order Confirmation</h2>
      <p>Dear ${data.userName || 'Customer'},</p>
      <p>Thank you for your order #${data.orderId}!</p>
      <p>Order Total: $${data.orderTotal}</p>
      <p>Status: ${data.orderStatus}</p>
    `

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [data.userEmail],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      throw new Error(`Failed to send email: ${errorText}`)
    }

    const emailResult = await emailResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: emailResult.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
