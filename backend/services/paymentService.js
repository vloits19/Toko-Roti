/**
 * Payment Service - Placeholder untuk Payment Gateway
 * 
 * File ini berfungsi sebagai abstraction layer untuk semua proses pembayaran.
 * Saat ini menggunakan mock payment system, namun struktur sudah disiapkan
 * untuk integrasi mudah dengan payment gateway seperti Midtrans, Xendit, atau Stripe.
 */

const { v4: uuidv4 } = require('uuid');

class PaymentService {
  constructor() {
    // Konfigurasi payment gateway bisa ditambahkan di sini
    this.provider = process.env.PAYMENT_PROVIDER || 'mock';
    this.isSandbox = process.env.NODE_ENV !== 'production';
  }

  /**
   * Membuat transaksi pembayaran baru
   * @param {Object} orderData - Data order
   * @param {number} orderData.order_id - ID order
   * @param {number} orderData.amount - Total pembayaran
   * @param {string} orderData.customer_name - Nama customer
   * @param {string} orderData.customer_email - Email customer
   * @param {string} orderData.payment_method - Metode pembayaran
   * @returns {Object} - Response dari payment gateway
   */
  async createTransaction(orderData) {
    const { order_id, amount, customer_name, customer_email, payment_method } = orderData;

    // Generate unique transaction ID
    const transactionId = `TRX-${Date.now()}-${uuidv4().slice(0, 8)}`;

    switch (this.provider) {
      case 'midtrans':
        return this._createMidtransTransaction(orderData, transactionId);
      
      case 'xendit':
        return this._createXenditTransaction(orderData, transactionId);
      
      case 'stripe':
        return this._createStripeTransaction(orderData, transactionId);
      
      case 'mock':
      default:
        return this._createMockTransaction(orderData, transactionId);
    }
  }

  /**
   * Mock Payment System
   * Simulasi proses pembayaran untuk development
   */
  async _createMockTransaction(orderData, transactionId) {
    console.log('[MOCK PAYMENT] Creating transaction:', {
      transaction_id: transactionId,
      order_id: orderData.order_id,
      amount: orderData.amount,
      payment_method: orderData.payment_method
    });

    // Simulasi delay network
    await this._delay(500);

    // Mock response yang mirip dengan response payment gateway nyata
    const mockResponse = {
      success: true,
      transaction_id: transactionId,
      order_id: orderData.order_id,
      amount: orderData.amount,
      currency: 'IDR',
      payment_method: orderData.payment_method,
      status: 'pending',
      
      // URL untuk redirect user (untuk pembayaran yang memerlukan redirect)
      redirect_url: null,
      
      // Token untuk payment form (untuk Stripe dsb)
      payment_token: null,
      
      // Informasi pembayaran manual (transfer bank, dll)
      payment_info: this._getMockPaymentInfo(orderData.payment_method, transactionId),
      
      // Expiry time
      expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      
      // Metadata tambahan
      metadata: {
        provider: 'mock',
        sandbox: true,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email
      }
    };

    // Untuk metode tertentu, tambahkan redirect URL
    if (['credit_card', 'gopay', 'shopeepay'].includes(orderData.payment_method)) {
      mockResponse.redirect_url = `/payment/mock/${transactionId}`;
    }

    return mockResponse;
  }

  /**
   * Placeholder untuk Midtrans integration
   * Dokumentasi: https://docs.midtrans.com/
   */
  async _createMidtransTransaction(orderData, transactionId) {
    // TODO: Implementasi Midtrans Snap API
    // 1. Install midtrans-client: npm install midtrans-client
    // 2. Import dan konfigurasi Midtrans
    // 3. Buat transaction ke Midtrans
    // 4. Return response yang sesuai

    /*
    const midtransClient = require('midtrans-client');
    
    const snap = new midtransClient.Snap({
      isProduction: !this.isSandbox,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    const parameter = {
      transaction_details: {
        order_id: orderData.order_id,
        gross_amount: orderData.amount
      },
      customer_details: {
        first_name: orderData.customer_name,
        email: orderData.customer_email
      }
    };

    const transaction = await snap.createTransaction(parameter);
    return {
      success: true,
      transaction_id: transactionId,
      redirect_url: transaction.redirect_url,
      token: transaction.token,
      ...
    };
    */

    throw new Error('Midtrans integration not implemented yet');
  }

  /**
   * Placeholder untuk Xendit integration
   * Dokumentasi: https://docs.xendit.co/
   */
  async _createXenditTransaction(orderData, transactionId) {
    // TODO: Implementasi Xendit API
    // 1. Install xendit-node: npm install xendit-node
    // 2. Import dan konfigurasi Xendit
    // 3. Buat invoice atau payment request
    // 4. Return response yang sesuai

    /*
    const Xendit = require('xendit-node');
    
    const xendit = new Xendit({
      secretKey: process.env.XENDIT_SECRET_KEY
    });

    const { Invoice } = xendit;
    const invoice = new Invoice({});

    const response = await invoice.createInvoice({
      externalID: orderData.order_id.toString(),
      amount: orderData.amount,
      payerEmail: orderData.customer_email,
      description: `Order #${orderData.order_id}`
    });

    return {
      success: true,
      transaction_id: transactionId,
      invoice_url: response.invoice_url,
      ...
    };
    */

    throw new Error('Xendit integration not implemented yet');
  }

  /**
   * Placeholder untuk Stripe integration
   * Dokumentasi: https://stripe.com/docs/api
   */
  async _createStripeTransaction(orderData, transactionId) {
    // TODO: Implementasi Stripe API
    // 1. Install stripe: npm install stripe
    // 2. Import dan konfigurasi Stripe
    // 3. Buat PaymentIntent
    // 4. Return client secret untuk frontend

    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: orderData.amount * 100, // Stripe menggunakan smallest currency unit
      currency: 'idr',
      metadata: {
        order_id: orderData.order_id,
        customer_name: orderData.customer_name
      }
    });

    return {
      success: true,
      transaction_id: transactionId,
      client_secret: paymentIntent.client_secret,
      ...
    };
    */

    throw new Error('Stripe integration not implemented yet');
  }

  /**
   * Verifikasi status pembayaran
   * @param {string} transactionId - ID transaksi
   * @returns {Object} - Status pembayaran
   */
  async verifyPayment(transactionId) {
    switch (this.provider) {
      case 'midtrans':
        // TODO: Implementasi verifikasi Midtrans
        break;
      
      case 'xendit':
        // TODO: Implementasi verifikasi Xendit
        break;
      
      case 'stripe':
        // TODO: Implementasi verifikasi Stripe
        break;
      
      case 'mock':
      default:
        return this._verifyMockPayment(transactionId);
    }
  }

  /**
   * Mock payment verification
   */
  async _verifyMockPayment(transactionId) {
    // Simulasi verifikasi
    await this._delay(300);

    // Untuk demo, 90% berhasil, 10% gagal
    const isSuccess = Math.random() > 0.1;

    return {
      success: isSuccess,
      transaction_id: transactionId,
      status: isSuccess ? 'paid' : 'failed',
      paid_at: isSuccess ? new Date().toISOString() : null,
      message: isSuccess ? 'Payment verified successfully' : 'Payment failed or cancelled'
    };
  }

  /**
   * Handle webhook dari payment gateway
   * @param {string} provider - Nama provider
   * @param {Object} payload - Data webhook
   */
  async handleWebhook(provider, payload) {
    console.log(`[WEBHOOK] Received from ${provider}:`, payload);

    // TODO: Implementasi handling webhook untuk masing-masing provider
    // 1. Verifikasi signature webhook
    // 2. Update status order di database
    // 3. Kirim notifikasi ke user

    return { received: true };
  }

  /**
   * Generate informasi pembayaran untuk mock
   */
  _getMockPaymentInfo(paymentMethod, transactionId) {
    const paymentInfoMap = {
      bank_transfer: {
        bank_name: 'Bank Central Asia (BCA)',
        account_number: '1234567890',
        account_name: 'PT Roti Lezat Indonesia',
        instructions: 'Transfer ke rekening di atas sesuai dengan total pembayaran'
      },
      virtual_account: {
        bank_name: 'Bank Mandiri',
        va_number: '88700' + transactionId.slice(-10),
        instructions: 'Bayar melalui ATM, Mobile Banking, atau Internet Banking'
      },
      e_wallet: {
        wallet_type: 'GoPay/OVO/Dana',
        qr_code_url: `/payment/qr/${transactionId}`,
        instructions: 'Scan QR code dengan aplikasi e-wallet Anda'
      },
      credit_card: {
        instructions: 'Anda akan diarahkan ke halaman pembayaran kartu kredit'
      },
      cod: {
        instructions: 'Bayar tunai saat pesanan datang'
      }
    };

    return paymentInfoMap[paymentMethod] || paymentInfoMap.bank_transfer;
  }

  /**
   * Helper: delay untuk simulasi network
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
module.exports = new PaymentService();
