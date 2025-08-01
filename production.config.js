
module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: '0.0.0.0',
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com', 'https://www.your-domain.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    session: {
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    },
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    pool: {
      min: 2,
      max: 10,
      acquire: 30000,
      idle: 10000,
    },
  },

  // Payment Gateway Configuration
  payments: {
    flutterwave: {
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
      encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY,
      webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET,
    },
    paystack: {
      secretKey: process.env.PAYSTACK_SECRET_KEY,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
    },
    crypto: {
      addresses: {
        btc: process.env.BTC_ADDRESS || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        eth: process.env.ETH_ADDRESS || '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2',
        usdt: process.env.USDT_ADDRESS || '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2',
        matic: process.env.MATIC_ADDRESS || '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2',
      },
      blockchains: {
        btc: {
          network: 'mainnet',
          explorer: 'https://blockstream.info',
        },
        eth: {
          network: 'mainnet',
          explorer: 'https://etherscan.io',
        },
        usdt: {
          network: 'ethereum',
          explorer: 'https://etherscan.io',
        },
        matic: {
          network: 'polygon',
          explorer: 'https://polygonscan.com',
        },
      },
    },
  },

  // OAuth Configuration
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    twitter: {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL || '/api/auth/twitter/callback',
    },
  },

  // Premium Configuration
  premium: {
    plans: {
      monthly: {
        price: 2.00, // USD
        nairaPrice: 3000, // NGN
        duration: 30, // days
        features: [
          'ad_free',
          'instant_approval',
          'enhanced_reach',
          'priority_support',
          'advanced_analytics',
          'unlimited_submissions',
        ],
      },
      yearly: {
        price: 20.00, // USD
        nairaPrice: 30000, // NGN
        duration: 365, // days
        discount: 0.17, // 17% discount
        features: [
          'ad_free',
          'instant_approval',
          'enhanced_reach',
          'priority_support',
          'advanced_analytics',
          'unlimited_submissions',
          'beta_features',
        ],
      },
    },
    features: {
      ad_free: {
        name: 'Ad-Free Experience',
        description: 'No advertisements while browsing',
      },
      instant_approval: {
        name: 'Instant Post Approval',
        description: 'No need to like posts for approval',
      },
      enhanced_reach: {
        name: 'Enhanced Reach',
        description: '5x more visibility for your posts',
      },
      priority_support: {
        name: 'Priority Support',
        description: '24/7 dedicated support',
      },
      advanced_analytics: {
        name: 'Advanced Analytics',
        description: 'Detailed performance insights',
      },
      unlimited_submissions: {
        name: 'Unlimited Submissions',
        description: 'No daily post limits',
      },
    },
  },

  // Logging Configuration
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'combined',
    transports: [
      {
        type: 'console',
        colorize: process.env.NODE_ENV !== 'production',
      },
      {
        type: 'file',
        filename: 'logs/app.log',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        rotationFormat: false,
      },
    ],
  },

  // Cache Configuration
  cache: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      ttl: 3600, // 1 hour default TTL
    },
    memory: {
      max: 500,
      ttl: 300, // 5 minutes
    },
  },

  // Email Configuration
  email: {
    service: 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    from: process.env.EMAIL_FROM || 'noreply@boostbuddies.com',
  },

  // Monitoring Configuration
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    },
    analytics: {
      googleAnalyticsId: process.env.GA_TRACKING_ID,
      mixpanelToken: process.env.MIXPANEL_TOKEN,
    },
  },

  // Security Configuration
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", "wss:", "ws:"],
        },
      },
    },
    bcrypt: {
      saltRounds: 12,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    },
  },

  // Feature Flags
  features: {
    enableWebSocket: true,
    enableCryptoPayments: true,
    enableGoogleAuth: true,
    enableTwitterAuth: true,
    enableEmailAuth: true,
    enablePremium: true,
    enableAnalytics: true,
    enableCommunities: true,
    enableLiveEvents: true,
    enableCollabSpotlights: true,
  },

  // API Configuration
  api: {
    version: 'v1',
    prefix: '/api',
    timeout: 30000, // 30 seconds
    maxRequestSize: '10mb',
  },

  // File Upload Configuration
  uploads: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    destination: process.env.UPLOAD_PATH || './uploads',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  },
};
