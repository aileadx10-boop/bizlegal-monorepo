// Server-safe payment gateway + bank account config
// Bank account details for wire transfer / invoice display only

export const PAYMENT_GATEWAYS = {
  crypto: {
    provider: 'NOWPayments',
    ethAddress: '0x9FCfb4C42f4a211B2e11153eF668F30a7E1886DD',
    supportedCoins: ['ETH', 'BTC', 'USDT', 'USDC', 'BNB', 'SOL'],
  },
  paypal: {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '',
    currency: 'USD',
  },
} as const

export const BANK_ACCOUNTS = {
  EUR: {
    bank:        'Banking Circle S.A.',
    address:     '2, Boulevard de la Foire, L-1528 Luxembourg',
    iban:        'LU514080000045684561',
    bic:         'BCIRLULL',
    beneficiary: 'Moses Dor',
    currency:    'EUR',
  },
  USD: {
    bank:        'Citibank',
    address:     '111 Wall Street, New York, NY 10043, USA',
    routing:     '031100209',
    swift:       'CITIUS33',
    account:     '70580010002349756',
    accountType: 'CHECKING',
    beneficiary: 'Moses Dor',
    currency:    'USD',
  },
} as const

export const PAYONEER = {
  provider: 'Payoneer',
  accounts: BANK_ACCOUNTS,
} as const
