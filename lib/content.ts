import { brand } from "./config";

export interface InfoSection {
  heading: { zh: string; en: string };
  body: { zh: string[]; en: string[] };
}

export interface InfoPage {
  slug: string;
  title: { zh: string; en: string };
  intro: { zh: string; en: string };
  sections: InfoSection[];
}

export const infoPages: Record<string, InfoPage> = {
  about: {
    slug: "about",
    title: { zh: "关于 WALLINE 沃澜", en: "About WALLINE" },
    intro: {
      zh: "WALLINE 沃澜是一家位于广东佛山的建筑装饰线条制造商。我们只做一件事：把墙面与顶面的收口做得干净、耐久、可复制。",
      en: "WALLINE is an architectural profile manufacturer based in Foshan, Guangdong. We do one thing: make wall and ceiling edges clean, durable and repeatable.",
    },
    sections: [
      {
        heading: { zh: "自有工厂", en: "Our own factory" },
        body: {
          zh: [
            "18,000 ㎡ 厂房，6 条铝合金挤压线与 4 条竹木纤维包覆线，从型材到表面处理全部自有产线。",
            "常备 22 个型号、四种标准色，工程批量可在 7–15 天内排产，国内现货 48 小时内发出。",
          ],
          en: [
            "An 18,000 m² plant with six aluminium extrusion lines and four wood-fibre lamination lines — extrusion through finishing, all in-house.",
            "Twenty-two standard profiles in four finishes, dispatched within 48 hours in China; project batches produced in 7–15 days.",
          ],
        },
      },
      {
        heading: { zh: "为工程而生", en: "Built for projects" },
        body: {
          zh: [
            `${brand.years} 年来我们服务了 ${brand.projects}+ 个工程项目，出口到 ${brand.countries} 个国家与地区。`,
            "同一栋楼的颜色一致性、整箱包装强度、清关文件规范——这些是工程客户真正在意的细节。",
          ],
          en: [
            `Over ${brand.years} years we have supplied ${brand.projects}+ projects in ${brand.countries} export markets.`,
            "Batch colour consistency, carton strength and clean customs paperwork are the details contractors actually care about.",
          ],
        },
      },
      {
        heading: { zh: "合作方式", en: "How to work with us" },
        body: {
          zh: [
            "零单、样品单、整柜订单同样受理。在线下单支持支付宝 / 微信 / 银行卡 / PayPal / 电汇。",
            "有图纸或尺寸清单？发到 sales@walline.com，24 小时内给你材料清单与报价。",
          ],
          en: [
            "Single pieces, sample kits and full containers are all welcome. Pay online with Alipay, WeChat Pay, card, PayPal or T/T.",
            "Have drawings or a cutting list? Email sales@walline.com for a bill of materials and quote within 24 hours.",
          ],
        },
      },
    ],
  },
  contact: {
    slug: "contact",
    title: { zh: "联系我们", en: "Contact us" },
    intro: {
      zh: "工程报价、样品索取、安装咨询，都可以直接联系业务团队。工作日 9:00–18:00（北京时间）即时回复。",
      en: "Project quotes, samples and installation questions — reach the sales team directly. We reply during business hours, 09:00–18:00 China time.",
    },
    sections: [
      {
        heading: { zh: "销售与报价", en: "Sales and quotes" },
        body: {
          zh: [`邮箱：${brand.email}`, `电话 / WhatsApp：${brand.phoneZh}`, "企业采购可开具增值税专用发票。"],
          en: [`Email: ${brand.email}`, `Phone / WhatsApp: ${brand.phoneEn}`, "Company purchases can be invoiced with VAT invoices."],
        },
      },
      {
        heading: { zh: "工厂地址", en: "Factory" },
        body: {
          zh: [brand.addressZh, "到厂参观请提前一天预约，我们安排样品间与产线参观。"],
          en: [brand.addressEn, "Factory visits are welcome with one day's notice — we will arrange the sample room and line tour."],
        },
      },
      {
        heading: { zh: "售后与物流", en: "After-sales and logistics" },
        body: {
          zh: ["订单问题请在“我的账户 → 我的订单”中查看订单号后联系我们，回复更快。", "运输破损请在签收后 48 小时内提供照片，我们按比例补发。"],
          en: [
            "For order issues, include your order number from Account → Orders so we can respond faster.",
            "Report transit damage with photos within 48 hours of delivery and we will replace the affected pieces.",
          ],
        },
      },
    ],
  },
  shipping: {
    slug: "shipping",
    title: { zh: "配送政策", en: "Shipping policy" },
    intro: {
      zh: "国内现货 48 小时内发出；海外订单备货 3–7 天后发运。运费在结算页按目的地与总重量实时计算。",
      en: "In-stock items leave within 48 hours in China; international orders dispatch 3–7 days after payment. Shipping is calculated at checkout from destination and weight.",
    },
    sections: [
      {
        heading: { zh: "国内配送", en: "China delivery" },
        body: {
          zh: [
            "顺丰速运：首重 ¥25，满 ¥999 免运费，1–2 天送达。",
            "德邦物流：基础 ¥40 + ¥8/kg，满 ¥2,999 免运费，适合整箱与整托。",
            "佛山工厂自提：免运费，工作日 9:00–17:00。",
          ],
          en: [
            "SF Express: ¥25 base, free above ¥999, 1–2 days.",
            "Debang Logistics: ¥40 + ¥8/kg, free above ¥2,999 — best for cartons and pallets.",
            "Factory pickup in Foshan: free, weekdays 09:00–17:00.",
          ],
        },
      },
      {
        heading: { zh: "海外配送", en: "International delivery" },
        body: {
          zh: [
            "亚洲：DHL 快递 3–5 天、空运专线 5–8 天、海运拼箱 18–25 天。",
            "欧美及其他地区：DHL 快递 5–7 天、空运专线 7–12 天、海运整柜/拼箱 28–40 天。",
            "报价条款支持 FOB、CIF、DDP，清关文件（发票、装箱单、原产地证）随货提供。",
          ],
          en: [
            "Asia: DHL express 3–5 days, consolidated air 5–8 days, LCL sea 18–25 days.",
            "Europe, Americas and rest of world: DHL 5–7 days, air 7–12 days, sea FCL/LCL 28–40 days.",
            "Quotes available FOB, CIF or DDP, with invoice, packing list and certificate of origin included.",
          ],
        },
      },
      {
        heading: { zh: "关税与清关", en: "Duties and customs" },
        body: {
          zh: ["DDP 条款下关税与增值税由我们承担并代缴；FOB / CIF 条款下由收货方承担。", "如遇目的国清关要求补充文件，我们会配合提供。"],
          en: [
            "Under DDP we pay duties and VAT; under FOB or CIF they are the buyer's responsibility.",
            "If customs requires additional documents we will supply them promptly.",
          ],
        },
      },
    ],
  },
  returns: {
    slug: "returns",
    title: { zh: "退换货政策", en: "Returns policy" },
    intro: {
      zh: "标准品未拆封可 7 天内无理由退换；定制品与已上墙产品按质量问题处理。",
      en: "Unopened standard items can be returned within 7 days; custom finishes and installed panels are handled as quality claims.",
    },
    sections: [
      {
        heading: { zh: "可退换情形", en: "Eligible returns" },
        body: {
          zh: ["标准型号、未拆封、包装完好，签收后 7 天内可申请退货，运费由买家承担。", "发错货、数量不符、明显质量缺陷，我们承担来回运费并优先补发。"],
          en: [
            "Standard profiles, unopened and in original packaging, within 7 days of delivery — return shipping paid by the buyer.",
            "Wrong item, short quantity or a clear manufacturing defect — we cover shipping both ways and prioritise replacement.",
          ],
        },
      },
      {
        heading: { zh: "不可退换情形", en: "Not eligible" },
        body: {
          zh: ["已裁切、已上墙或已涂装的产品；定制颜色（来样调色）批次；样品册与色卡。"],
          en: ["Cut, installed or painted pieces; custom colour batches; sample kits and swatch cards."],
        },
      },
      {
        heading: { zh: "申请流程", en: "How to claim" },
        body: {
          zh: ["在“我的账户 → 我的订单”找到订单号，发邮件至 sales@walline.com 并附照片。", "我们 1 个工作日内确认，退货验收后 3–5 个工作日原路退款。"],
          en: [
            "Find your order number under Account → Orders and email sales@walline.com with photos.",
            "We confirm within one business day and refund the original payment method 3–5 days after inspection.",
          ],
        },
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: { zh: "隐私政策", en: "Privacy policy" },
    intro: {
      zh: "我们只收集完成订单与售后所必需的信息，不向第三方出售数据。",
      en: "We collect only what is needed to fulfil and support your order, and never sell your data.",
    },
    sections: [
      {
        heading: { zh: "我们收集什么", en: "What we collect" },
        body: {
          zh: ["账户信息（邮箱、姓名、公司、电话、国家）与收货地址，用于订单履约与物流。", "订单与支付状态；银行卡信息由支付渠道处理，我们不会接触完整卡号。"],
          en: [
            "Account details (email, name, company, phone, country) and shipping addresses, used for fulfilment and logistics.",
            "Order and payment status. Card data is handled by the payment provider; we never see full card numbers.",
          ],
        },
      },
      {
        heading: { zh: "如何使用", en: "How we use it" },
        body: {
          zh: ["发送订单确认、物流通知与售后沟通；改进产品与站点体验。", "未经同意不会发送营销邮件，可随时退订。"],
          en: [
            "Order confirmations, tracking notifications and after-sales communication; improving our products and site.",
            "No marketing email without consent, and you can unsubscribe at any time.",
          ],
        },
      },
      {
        heading: { zh: "你的权利", en: "Your rights" },
        body: {
          zh: ["可随时请求查询、更正或删除账户数据，发邮件至 sales@walline.com。", "我们保留订单与发票记录以满足税务与海关合规要求。"],
          en: [
            "Request access to, correction of, or deletion of your account data at sales@walline.com.",
            "We retain order and invoice records as required for tax and customs compliance.",
          ],
        },
      },
    ],
  },
  terms: {
    slug: "terms",
    title: { zh: "销售条款", en: "Terms of sale" },
    intro: {
      zh: "提交订单即表示接受以下条款。条款以中文版本为准，英文版本供参考。",
      en: "By placing an order you accept the terms below. The Chinese version prevails; the English version is a reference translation.",
    },
    sections: [
      {
        heading: { zh: "价格与支付", en: "Prices and payment" },
        body: {
          zh: [
            "站内价格以人民币为基准，按参考汇率换算为其他币种展示，最终结算金额以支付渠道实际扣款为准。",
            "订单提交后 3 个工作日内未付款的，系统可取消订单；电汇订单以到账时间为准。",
          ],
          en: [
            "Prices are based in CNY and converted for display at reference rates; the amount actually charged by the payment provider prevails.",
            "Unpaid orders may be cancelled after 3 business days; T/T orders are confirmed on receipt of funds.",
          ],
        },
      },
      {
        heading: { zh: "交付与风险", en: "Delivery and risk" },
        body: {
          zh: ["交期以订单页显示为准，遇不可抗力顺延。", "风险自货物交付承运人时转移；DDP 条款下由我们承担至目的地。"],
          en: [
            "Lead times are as shown on the order; force majeure extends them accordingly.",
            "Risk passes to the carrier on dispatch; under DDP we remain responsible until destination.",
          ],
        },
      },
      {
        heading: { zh: "质量与责任", en: "Quality and liability" },
        body: {
          zh: [
            "产品按页面标示规格交付，色差在 ΔE ≤ 1.0 范围内视为合格。",
            "我们的责任上限为相关订单的货款金额；不承担间接损失。",
          ],
          en: [
            "Products are supplied to the published specification; colour deviation within ΔE ≤ 1.0 is considered conforming.",
            "Our liability is limited to the value of the affected order and excludes indirect loss.",
          ],
        },
      },
    ],
  },
};

export const infoSlugs = Object.keys(infoPages);
