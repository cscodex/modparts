// Supabase Edge Function for sending order confirmation emails
// Deploy this to Supabase Edge Functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderEmailData {
  orderId: string
  userEmail: string
  userName: string
  orderTotal: number
  orderItems: Array<{
    name: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    address: string
    city: string
    state: string
    zipCode: string
  }
  orderStatus: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, data }: { type: string, data: OrderEmailData } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Email service configuration
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const GMAIL_USER = Deno.env.get('GMAIL_USER')
    const GMAIL_PASS = Deno.env.get('GMAIL_PASS')
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@sardaarjiautoparts.onrender.com'
    const EMAIL_PROVIDER = Deno.env.get('EMAIL_PROVIDER') || 'resend' // 'resend', 'gmail', 'sendgrid'

    // Check which email provider is configured
    if (EMAIL_PROVIDER === 'gmail' && (!GMAIL_USER || !GMAIL_PASS)) {
      throw new Error('GMAIL_USER and GMAIL_PASS environment variables are required for Gmail')
    } else if (EMAIL_PROVIDER === 'resend' && !RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required for Resend')
    }

    let emailSubject = ''
    let emailHtml = ''

    // Generate email content based on type
    switch (type) {
      case 'order_confirmation':
        emailSubject = `Order Confirmation #${data.orderId} - Sardaarji Auto Parts`
        emailHtml = generateOrderConfirmationEmail(data)
        break
      
      case 'order_shipped':
        emailSubject = `Your Order #${data.orderId} Has Been Shipped!`
        emailHtml = generateOrderShippedEmail(data)
        break
      
      case 'order_delivered':
        emailSubject = `Order #${data.orderId} Delivered Successfully`
        emailHtml = generateOrderDeliveredEmail(data)
        break
      
      case 'order_cancelled':
        emailSubject = `Order #${data.orderId} Cancelled`
        emailHtml = generateOrderCancelledEmail(data)
        break
      
      default:
        throw new Error(`Unknown email type: ${type}`)
    }

    // Send email based on provider
    let emailResult

    if (EMAIL_PROVIDER === 'gmail') {
      // Use Gmail SMTP (for testing purposes)
      emailResult = await sendEmailViaGmail(data.userEmail, emailSubject, emailHtml, GMAIL_USER, GMAIL_PASS)
    } else if (EMAIL_PROVIDER === 'resend') {
      // Use Resend API
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
        throw new Error(`Failed to send email via Resend: ${errorText}`)
      }

      emailResult = await emailResponse.json()
    } else {
      throw new Error(`Unsupported email provider: ${EMAIL_PROVIDER}`)
    }

    // Log email sent to database for tracking
    await supabaseClient
      .from('email_logs')
      .insert({
        order_id: data.orderId,
        email_type: type,
        recipient_email: data.userEmail,
        email_id: emailResult.id,
        status: 'sent',
        sent_at: new Date().toISOString()
      })

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
    console.error('Error sending email:', error)
    
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

// Email template functions
function generateOrderConfirmationEmail(data: OrderEmailData): string {
  const itemsHtml = data.orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af;">🚗 Sardaarji Auto Parts</h1>
          <h2 style="color: #059669;">Order Confirmation</h2>
        </div>
        
        <p>Dear ${data.userName},</p>
        
        <p>Thank you for your order! We're excited to confirm that we've received your order and it's being processed.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> #${data.orderId}</p>
          <p><strong>Order Total:</strong> $${data.orderTotal.toFixed(2)}</p>
          <p><strong>Status:</strong> ${data.orderStatus}</p>
        </div>
        
        <h3>Items Ordered:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #1e40af; color: white;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="background: #f1f5f9; font-weight: bold;">
              <td colspan="3" style="padding: 12px; text-align: right;">Order Total:</td>
              <td style="padding: 12px; text-align: right;">$${data.orderTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <h3>Shipping Address:</h3>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
          <p style="margin: 5px 0;">${data.shippingAddress.address}</p>
          <p style="margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}</p>
        </div>
        
        <div style="margin: 30px 0; padding: 20px; background: #ecfdf5; border-radius: 8px;">
          <h3 style="color: #059669; margin-top: 0;">What's Next?</h3>
          <ul>
            <li>We'll process your order within 1-2 business days</li>
            <li>You'll receive a shipping confirmation email with tracking information</li>
            <li>Your order will be delivered within 3-7 business days</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>Questions about your order? Contact us at <a href="mailto:support@sardaarjiautoparts.com">support@sardaarjiautoparts.com</a></p>
          <p style="color: #666; font-size: 14px;">Thank you for choosing Sardaarji Auto Parts!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateOrderShippedEmail(data: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af;">🚗 Sardaarji Auto Parts</h1>
          <h2 style="color: #7c3aed;">📦 Your Order Has Shipped!</h2>
        </div>
        
        <p>Great news, ${data.userName}!</p>
        
        <p>Your order #${data.orderId} has been shipped and is on its way to you.</p>
        
        <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #7c3aed; margin-top: 0;">🚚 Estimated Delivery: 3-5 Business Days</h3>
          <p>You'll receive tracking information shortly.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateOrderDeliveredEmail(data: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af;">🚗 Sardaarji Auto Parts</h1>
          <h2 style="color: #059669;">✅ Order Delivered Successfully!</h2>
        </div>
        
        <p>Hello ${data.userName},</p>
        
        <p>Your order #${data.orderId} has been delivered successfully!</p>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #059669; margin-top: 0;">🎉 Enjoy Your New Auto Parts!</h3>
          <p>We hope you're satisfied with your purchase.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>Please consider leaving a review to help other customers!</p>
          <p>Questions? Contact us at <a href="mailto:support@sardaarjiautoparts.com">support@sardaarjiautoparts.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateOrderCancelledEmail(data: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af;">🚗 Sardaarji Auto Parts</h1>
          <h2 style="color: #dc2626;">Order Cancelled</h2>
        </div>

        <p>Dear ${data.userName},</p>

        <p>We're writing to confirm that your order #${data.orderId} has been cancelled as requested.</p>

        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">Refund Information</h3>
          <p>If you paid for this order, your refund will be processed within 3-5 business days.</p>
          <p><strong>Order Total:</strong> $${data.orderTotal.toFixed(2)}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p>We're sorry to see you go. If you have any questions, please contact us.</p>
          <p>Email: <a href="mailto:support@sardaarjiautoparts.com">support@sardaarjiautoparts.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Gmail SMTP function for testing purposes
async function sendEmailViaGmail(to: string, subject: string, html: string, gmailUser: string, gmailPass: string) {
  // Note: This is a simplified implementation for testing
  // In production, you should use a proper SMTP library

  const emailData = {
    to,
    subject,
    html,
    from: gmailUser
  }

  // For now, just log the email (you'd need to implement actual SMTP)
  console.log('📧 Gmail Email (simulated):', emailData)

  // Return a mock response
  return {
    id: `gmail_${Date.now()}`,
    status: 'sent'
  }
}
