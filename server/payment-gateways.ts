
import crypto from 'crypto';

// Express middleware to parse raw body for webhooks
export const rawBodyMiddleware = (req: any, res: any, next: any) => {
  if (req.path.includes('/webhooks/')) {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = data;
      try {
        req.body = JSON.parse(data);
      } catch (e) {
        req.body = {};
      }
      next();
    });
  } else {
    next();
  }
};

// Flutterwave configuration
export class FlutterwaveGateway {
  private secretKey: string;
  private publicKey: string;
  private encryptionKey: string;
  private baseUrl = 'https://api.flutterwave.com/v3';

  constructor() {
    this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
    this.publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY || '';
    this.encryptionKey = process.env.FLUTTERWAVE_ENCRYPTION_KEY || '';
  }

  async initializePayment(paymentData: {
    amount: number;
    currency: string;
    email: string;
    txRef: string;
    redirectUrl: string;
    customerName: string;
  }) {
    try {
      const payload = {
        tx_ref: paymentData.txRef,
        amount: paymentData.amount,
        currency: paymentData.currency,
        redirect_url: paymentData.redirectUrl,
        customer: {
          email: paymentData.email,
          name: paymentData.customerName,
        },
        customizations: {
          title: 'BoostBuddies Premium Subscription',
          description: 'Premium subscription payment',
          logo: 'https://your-logo-url.com/logo.png',
        },
      };

      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Flutterwave payment initialization error:', error);
      throw error;
    }
  }

  async verifyPayment(transactionId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Flutterwave payment verification error:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.FLUTTERWAVE_WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }
}

// Paystack configuration
export class PaystackGateway {
  private secretKey: string;
  private publicKey: string;
  private baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY || '';
  }

  async initializePayment(paymentData: {
    amount: number;
    email: string;
    reference: string;
    callbackUrl: string;
    customerName: string;
  }) {
    try {
      const payload = {
        reference: paymentData.reference,
        amount: paymentData.amount * 100, // Paystack expects amount in kobo
        email: paymentData.email,
        callback_url: paymentData.callbackUrl,
        metadata: {
          customer_name: paymentData.customerName,
          product: 'BoostBuddies Premium Subscription',
        },
      };

      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paystack payment initialization error:', error);
      throw error;
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paystack payment verification error:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.PAYSTACK_WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }
}

// Crypto payment handler
export class CryptoPaymentHandler {
  private addresses = {
    btc: process.env.BTC_ADDRESS || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    eth: process.env.ETH_ADDRESS || '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2',
    usdt: process.env.USDT_ADDRESS || '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2',
    matic: process.env.MATIC_ADDRESS || '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2',
  };

  private explorers = {
    btc: 'https://blockstream.info',
    eth: 'https://etherscan.io',
    usdt: 'https://etherscan.io',
    matic: 'https://polygonscan.com',
  };

  getPaymentAddress(cryptoType: 'btc' | 'eth' | 'usdt' | 'matic'): string {
    return this.addresses[cryptoType] || '';
  }

  getExplorerUrl(cryptoType: 'btc' | 'eth' | 'usdt' | 'matic', txHash: string): string {
    const baseUrl = this.explorers[cryptoType];
    if (cryptoType === 'btc') {
      return `${baseUrl}/tx/${txHash}`;
    }
    return `${baseUrl}/tx/${txHash}`;
  }

  // For crypto payments, verification would typically involve:
  // 1. Blockchain API integration (like BlockCypher, Alchemy, etc.)
  // 2. Manual verification by admin
  // 3. Webhook from payment processor
  async generatePaymentInstructions(cryptoType: 'btc' | 'eth' | 'usdt' | 'matic', amount: number) {
    const address = this.getPaymentAddress(cryptoType);
    
    return {
      address,
      amount,
      cryptoType,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`,
      instructions: [
        `Send exactly ${amount} ${cryptoType.toUpperCase()} to the address above`,
        'Include the transaction hash when confirming payment',
        'Payment confirmation may take 15-30 minutes',
        'Contact support if you have issues with your payment',
      ],
    };
  }
}
