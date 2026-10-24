/**
 * Global store configuration: brand, locales, currencies, countries, payments.
 * Values that a merchant would realistically change live here (or in the DB settings table).
 */

export const brand = {
  name: "WALLINE",
  nameZh: "沃澜",
  fullName: "WALLINE 沃澜 · 建筑装饰线条",
  fullNameEn: "WALLINE Architectural Trim & Wall Panels",
  taglineZh: "铝合金线条 · 竹木纤维线条 · 背景墙板",
  taglineEn: "Aluminium profiles · Wood-fibre trims · Feature wall panels",
  email: "sales@walline.com",
  phoneZh: "+86 138 0000 0000",
  phoneEn: "+86 138 0000 0000",
  whatsapp: "+8613800000000",
  addressZh: "广东省佛山市南海区里水镇建材产业园 8 栋",
  addressEn: "Building 8, Building Materials Park, Lishui, Nanhai, Foshan, Guangdong, China",
  years: 12,
  projects: 2600,
  countries: 38,
  factoryArea: "18,000 m²",
} as const;

export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh";

export type CurrencyCode =
  | "CNY"
  | "USD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "JPY"
  | "HKD"
  | "SGD"
  | "CAD"
  | "AED";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  /** Reference rate: 1 CNY = rate units of this currency (settlement uses live PSP rate). */
  rate: number;
  /** Locale used for number formatting. */
  formattingLocale: string;
  labelZh: string;
  labelEn: string;
}

export const currencies: Record<CurrencyCode, Currency> = {
  CNY: { code: "CNY", symbol: "¥", rate: 1, formattingLocale: "zh-CN", labelZh: "人民币", labelEn: "Chinese Yuan" },
  USD: { code: "USD", symbol: "$", rate: 0.1405, formattingLocale: "en-US", labelZh: "美元", labelEn: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", rate: 0.121, formattingLocale: "de-DE", labelZh: "欧元", labelEn: "Euro" },
  GBP: { code: "GBP", symbol: "£", rate: 0.104, formattingLocale: "en-GB", labelZh: "英镑", labelEn: "British Pound" },
  AUD: { code: "AUD", symbol: "A$", rate: 0.216, formattingLocale: "en-AU", labelZh: "澳元", labelEn: "Australian Dollar" },
  JPY: { code: "JPY", symbol: "¥", rate: 21.8, formattingLocale: "ja-JP", labelZh: "日元", labelEn: "Japanese Yen" },
  HKD: { code: "HKD", symbol: "HK$", rate: 1.094, formattingLocale: "zh-HK", labelZh: "港币", labelEn: "Hong Kong Dollar" },
  SGD: { code: "SGD", symbol: "S$", rate: 0.181, formattingLocale: "en-SG", labelZh: "新加坡元", labelEn: "Singapore Dollar" },
  CAD: { code: "CAD", symbol: "C$", rate: 0.196, formattingLocale: "en-CA", labelZh: "加元", labelEn: "Canadian Dollar" },
  AED: { code: "AED", symbol: "AED", rate: 0.516, formattingLocale: "en-AE", labelZh: "阿联酋迪拉姆", labelEn: "UAE Dirham" },
};

export const currencyList = Object.values(currencies);

export type CountryGroup = "domestic" | "asia" | "global";

export interface Country {
  code: string;
  nameZh: string;
  nameEn: string;
  group: CountryGroup;
}

export const countries: Country[] = [
  { code: "CN", nameZh: "中国大陆", nameEn: "China (Mainland)", group: "domestic" },
  { code: "HK", nameZh: "中国香港", nameEn: "Hong Kong, China", group: "asia" },
  { code: "TW", nameZh: "中国台湾", nameEn: "Taiwan, China", group: "asia" },
  { code: "MO", nameZh: "中国澳门", nameEn: "Macao, China", group: "asia" },
  { code: "JP", nameZh: "日本", nameEn: "Japan", group: "asia" },
  { code: "KR", nameZh: "韩国", nameEn: "South Korea", group: "asia" },
  { code: "SG", nameZh: "新加坡", nameEn: "Singapore", group: "asia" },
  { code: "MY", nameZh: "马来西亚", nameEn: "Malaysia", group: "asia" },
  { code: "TH", nameZh: "泰国", nameEn: "Thailand", group: "asia" },
  { code: "VN", nameZh: "越南", nameEn: "Vietnam", group: "asia" },
  { code: "ID", nameZh: "印度尼西亚", nameEn: "Indonesia", group: "asia" },
  { code: "PH", nameZh: "菲律宾", nameEn: "Philippines", group: "asia" },
  { code: "IN", nameZh: "印度", nameEn: "India", group: "asia" },
  { code: "AE", nameZh: "阿联酋", nameEn: "United Arab Emirates", group: "global" },
  { code: "SA", nameZh: "沙特阿拉伯", nameEn: "Saudi Arabia", group: "global" },
  { code: "US", nameZh: "美国", nameEn: "United States", group: "global" },
  { code: "CA", nameZh: "加拿大", nameEn: "Canada", group: "global" },
  { code: "MX", nameZh: "墨西哥", nameEn: "Mexico", group: "global" },
  { code: "GB", nameZh: "英国", nameEn: "United Kingdom", group: "global" },
  { code: "DE", nameZh: "德国", nameEn: "Germany", group: "global" },
  { code: "FR", nameZh: "法国", nameEn: "France", group: "global" },
  { code: "IT", nameZh: "意大利", nameEn: "Italy", group: "global" },
  { code: "ES", nameZh: "西班牙", nameEn: "Spain", group: "global" },
  { code: "NL", nameZh: "荷兰", nameEn: "Netherlands", group: "global" },
  { code: "PL", nameZh: "波兰", nameEn: "Poland", group: "global" },
  { code: "RU", nameZh: "俄罗斯", nameEn: "Russia", group: "global" },
  { code: "AU", nameZh: "澳大利亚", nameEn: "Australia", group: "global" },
  { code: "NZ", nameZh: "新西兰", nameEn: "New Zealand", group: "global" },
  { code: "BR", nameZh: "巴西", nameEn: "Brazil", group: "global" },
  { code: "ZA", nameZh: "南非", nameEn: "South Africa", group: "global" },
];

export function countryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function countryGroup(code: string): CountryGroup {
  return countryByCode(code)?.group ?? "global";
}

/** Payment channels offered per market. */
export type PaymentMethodId = "wechat" | "alipay" | "stripe" | "paypal" | "bank_transfer";

export interface PaymentMethod {
  id: PaymentMethodId;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  markets: CountryGroup[];
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: "wechat",
    nameZh: "微信支付",
    nameEn: "WeChat Pay",
    descZh: "扫码支付，实时到账，支持国内主流银行卡。",
    descEn: "Scan to pay with WeChat in real time.",
    markets: ["domestic"],
  },
  {
    id: "alipay",
    nameZh: "支付宝",
    nameEn: "Alipay",
    descZh: "支持花呗分期与对公转账。",
    descEn: "Pay with Alipay, installment supported.",
    markets: ["domestic"],
  },
  {
    id: "stripe",
    nameZh: "银行卡支付 (Stripe)",
    nameEn: "Card payment (Stripe)",
    descZh: "Visa / Mastercard / American Express 安全支付。",
    descEn: "Secure Visa / Mastercard / American Express checkout.",
    markets: ["asia", "global"],
  },
  {
    id: "paypal",
    nameZh: "PayPal",
    nameEn: "PayPal",
    descZh: "使用 PayPal 余额或绑定的银行卡支付。",
    descEn: "Pay with your PayPal balance or linked card.",
    markets: ["asia", "global"],
  },
  {
    id: "bank_transfer",
    nameZh: "对公电汇 (T/T)",
    nameEn: "Bank transfer (T/T)",
    descZh: "大额订单推荐，30% 定金 + 尾款发货前付清。",
    descEn: "Recommended for large orders: 30% deposit, balance before shipment.",
    markets: ["domestic", "asia", "global"],
  },
];

export function paymentMethodsFor(code: string): PaymentMethod[] {
  const group = countryGroup(code);
  return paymentMethods.filter((m) => m.markets.includes(group));
}

/** Demo payment lets the whole funnel be exercised before PSP keys are configured. */
export const demoPaymentEnabled = process.env.DEMO_PAYMENT !== "false";

export const orderStatuses = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const statusLabels: Record<OrderStatus, { zh: string; en: string; tone: string }> = {
  pending_payment: { zh: "待付款", en: "Awaiting payment", tone: "amber" },
  paid: { zh: "已付款", en: "Paid", tone: "emerald" },
  processing: { zh: "备货中", en: "Processing", tone: "sky" },
  shipped: { zh: "已发货", en: "Shipped", tone: "indigo" },
  completed: { zh: "已完成", en: "Completed", tone: "emerald" },
  cancelled: { zh: "已取消", en: "Cancelled", tone: "slate" },
  refunded: { zh: "已退款", en: "Refunded", tone: "rose" },
};

export const sessionCookie = "walline_session";
export const cartCookie = "walline_cart";
export const currencyCookie = "walline_currency";
export const adminCookie = "walline_admin";
