// Email Service for sending order notifications
import { supabase } from '../lib/supabase';

class EmailService {
  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  }

  /**
   * Send order confirmation email
   * @param {Object} orderData - Order data including user info, items, etc.
   */
  async sendOrderConfirmation(orderData) {
    try {
      console.log('📧 Sending order confirmation email for order:', orderData.id);

      const emailData = await this.prepareOrderEmailData(orderData, 'order_confirmation');
      
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          type: 'order_confirmation',
          data: emailData
        }
      });

      if (error) {
        console.error('❌ Failed to send order confirmation email:', error);
        throw error;
      }

      console.log('✅ Order confirmation email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Email service error:', error);
      throw new Error(`Failed to send order confirmation email: ${error.message}`);
    }
  }

  /**
   * Send order status update email
   * @param {Object} orderData - Order data
   * @param {string} newStatus - New order status
   */
  async sendOrderStatusUpdate(orderData, newStatus) {
    try {
      console.log(`📧 Sending order status update email: ${newStatus} for order:`, orderData.id);

      const emailType = this.getEmailTypeFromStatus(newStatus);
      const emailData = await this.prepareOrderEmailData(orderData, emailType);
      
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          type: emailType,
          data: emailData
        }
      });

      if (error) {
        console.error('❌ Failed to send order status email:', error);
        throw error;
      }

      console.log('✅ Order status email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Email service error:', error);
      throw new Error(`Failed to send order status email: ${error.message}`);
    }
  }

  /**
   * Send welcome email to new users
   * @param {Object} userData - User data
   */
  async sendWelcomeEmail(userData) {
    try {
      console.log('📧 Sending welcome email to:', userData.email);

      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          type: 'welcome',
          data: {
            userEmail: userData.email,
            userName: `${userData.first_name} ${userData.last_name}`,
            userId: userData.id
          }
        }
      });

      if (error) {
        console.error('❌ Failed to send welcome email:', error);
        throw error;
      }

      console.log('✅ Welcome email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Email service error:', error);
      // Don't throw error for welcome emails - they're not critical
      console.warn('⚠️ Welcome email failed, but continuing...');
    }
  }

  /**
   * Prepare order data for email templates
   * @param {Object} orderData - Raw order data from database
   * @param {string} emailType - Type of email being sent
   */
  async prepareOrderEmailData(orderData, emailType) {
    try {
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', orderData.user_id)
        .single();

      if (userError) {
        throw new Error(`Failed to fetch user data: ${userError.message}`);
      }

      // Get order items with product details
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          price,
          products (
            name,
            description
          )
        `)
        .eq('order_id', orderData.id);

      if (itemsError) {
        throw new Error(`Failed to fetch order items: ${itemsError.message}`);
      }

      // Format order items for email
      const formattedItems = orderItems.map(item => ({
        name: item.products.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: item.quantity * parseFloat(item.price)
      }));

      // Prepare email data structure
      const emailData = {
        orderId: orderData.id,
        userEmail: userData.email,
        userName: `${userData.first_name} ${userData.last_name}`,
        orderTotal: parseFloat(orderData.total_amount),
        orderItems: formattedItems,
        orderStatus: orderData.status,
        shippingAddress: {
          address: orderData.shipping_address || '',
          city: orderData.shipping_city || '',
          state: orderData.shipping_state || '',
          zipCode: orderData.shipping_zip_code || ''
        },
        billingAddress: {
          address: orderData.billing_address || orderData.shipping_address || '',
          city: orderData.billing_city || orderData.shipping_city || '',
          state: orderData.billing_state || orderData.shipping_state || '',
          zipCode: orderData.billing_zip_code || orderData.shipping_zip_code || ''
        },
        paymentMethod: orderData.payment_method || 'Not specified',
        orderDate: new Date(orderData.created_at).toLocaleDateString(),
        estimatedDelivery: this.calculateEstimatedDelivery(orderData.created_at)
      };

      return emailData;
    } catch (error) {
      console.error('❌ Error preparing email data:', error);
      throw error;
    }
  }

  /**
   * Get email type based on order status
   * @param {string} status - Order status
   */
  getEmailTypeFromStatus(status) {
    const statusEmailMap = {
      'pending': 'order_confirmation',
      'processing': 'order_processing',
      'shipped': 'order_shipped',
      'delivered': 'order_delivered',
      'cancelled': 'order_cancelled'
    };

    return statusEmailMap[status] || 'order_status_update';
  }

  /**
   * Calculate estimated delivery date
   * @param {string} orderDate - Order creation date
   */
  calculateEstimatedDelivery(orderDate) {
    const order = new Date(orderDate);
    const delivery = new Date(order);
    delivery.setDate(delivery.getDate() + 7); // Add 7 days
    
    return delivery.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get email logs for an order (admin only)
   * @param {string} orderId - Order ID
   */
  async getEmailLogs(orderId) {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error fetching email logs:', error);
      throw error;
    }
  }

  /**
   * Resend email for an order (admin only)
   * @param {string} orderId - Order ID
   * @param {string} emailType - Type of email to resend
   */
  async resendOrderEmail(orderId, emailType) {
    try {
      // Get order data
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        throw new Error(`Failed to fetch order: ${orderError.message}`);
      }

      // Send email based on type
      if (emailType === 'order_confirmation') {
        return await this.sendOrderConfirmation(orderData);
      } else {
        return await this.sendOrderStatusUpdate(orderData, orderData.status);
      }
    } catch (error) {
      console.error('❌ Error resending email:', error);
      throw error;
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration() {
    try {
      console.log('🧪 Testing email configuration...');

      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          type: 'test',
          data: {
            userEmail: 'test@example.com',
            userName: 'Test User',
            orderId: 'TEST-' + Date.now(),
            orderTotal: 99.99,
            orderItems: [
              { name: 'Test Product', quantity: 1, price: 99.99 }
            ],
            orderStatus: 'pending',
            shippingAddress: {
              address: '123 Test St',
              city: 'Test City',
              state: 'TS',
              zipCode: '12345'
            }
          }
        }
      });

      if (error) {
        console.error('❌ Email test error:', error);
        throw error;
      }

      console.log('✅ Email test successful:', data);
      return { success: true, message: 'Email configuration is working correctly', data };
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);

      // Provide helpful error messages for common issues
      let helpfulMessage = error.message;

      if (error.message.includes('domain')) {
        helpfulMessage = `Domain verification issue. Try using a default email provider domain like 'onboarding@resend.dev' instead of a custom domain. Original error: ${error.message}`;
      } else if (error.message.includes('API key')) {
        helpfulMessage = `API key issue. Check that your email provider API key is correctly set in Supabase environment variables. Original error: ${error.message}`;
      } else if (error.message.includes('Function not found')) {
        helpfulMessage = `Edge function not deployed. Run 'supabase functions deploy send-order-email' to deploy the email function. Original error: ${error.message}`;
      }

      return { success: false, error: helpfulMessage };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
