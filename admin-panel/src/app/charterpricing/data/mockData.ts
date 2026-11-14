import {
  CharterRatesConfig,
  CustomTourConfig,
  TransferPricingConfig,
} from "../types/charterPricing.types";

export const INITIAL_CHARTER_RATES: CharterRatesConfig = {
  titleBase: {
    en: "Private Vehicle",
    ja: "専用車チャーター",
  },
  titleAccent: {
    en: "Charter Rates",
    ja: "料金・ご利用案内",
  },
  subtitleStrong: {
    en: "Transparent daily & transfer pricing",
    ja: "明朗な日額・送迎料金システム",
  },
  subtitle: {
    en: "All vehicles include a licensed chauffeur, fuel, highway tolls, and 24/7 concierge support across Sri Lanka.",
    ja: "すべての車両に英語・日本語対応の認定ドライバー、燃料費、高速道路料金、24時間コンシェルジュサポートが含まれます。",
  },
  popularBadge: {
    en: "Most Popular Choice",
    ja: "一番人気のプラン",
  },
  popularTitle: {
    en: "Chauffeur + Licensed Tour Guide",
    ja: "専用ドライバー＋公認ツアーガイド",
  },
  popularDesc: {
    en: "Ideal for cultural & wildlife circuits. Enjoy seamless navigation plus deep historical insights at every UNESCO site.",
    ja: "文化遺産やサファリ周遊に最適。快適な移動に加え、各世界遺産での詳しい歴史解説をお楽しみいただけます。",
  },
  ctaButton: {
    en: "Request Custom Vehicle Quote",
    ja: "専用車の無料お見積りを依頼",
  },
  ctaDesc: {
    en: "Instant confirmation within 2 hours · Flexible cancellation up to 14 days prior",
    ja: "2時間以内にスピード回答 · ご出発14日前までキャンセル柔軟対応",
  },
  notes: {
    en: [
      "Rates cover up to 100 km / 8 hours per day; extra mileage is billed at $0.45 per km.",
      "Airport pick-up and drop-off include complimentary 60-minute flight delay waiting time.",
      "Driver accommodation and meals are included in multi-day charter quotes.",
      "Child safety seats and Wi-Fi hotspot routers are available free upon advance request.",
    ],
    ja: [
      "料金には1日あたり100km・8時間までの走行が含まれます（超過分は1kmあたり$0.45）。",
      "空港送迎には、フライト遅延時最大60分までの無料待機時間が含まれます。",
      "宿泊を伴うチャーターの場合、ドライバーの宿泊費・食事代は料金に含まれています。",
      "チャイルドシートおよび車内Wi-Fiルーターは事前予約にて無料でご利用いただけます。",
    ],
  },
};

export const INITIAL_CUSTOM_TOUR: CustomTourConfig = {
  titleBase: {
    en: "Custom-Made",
    ja: "オーダーメイド",
  },
  titleAccent: {
    en: "Bespoke Journeys",
    ja: "プライベートツアー",
  },
  badgeText: {
    en: "100% Tailor-Made Itinerary",
    ja: "完全自由設計プラン",
  },
  subtitle: {
    en: "Designed around your pace, interests, and preferred hotel category — from boutique villas to luxury resorts.",
    ja: "お客様のご希望のペース、興味、ホテルランク（ブティックヴィラから高級リゾートまで）に合わせて設計します。",
  },
  description: {
    en: "Whether you are planning a romantic honeymoon, a family wildlife expedition, or a photography-focused cultural trail, our Sri Lanka specialists craft a day-by-day route with transparent itemized pricing and zero hidden markups.",
    ja: "ハネムーン、ご家族でのサファリ体験、写真撮影重視の文化周遊など、スリランカ専門プランナーが透明性の高い明細お見積りとともに最適な日程を作成いたします。",
  },
  ctaButton: {
    en: "Start Designing Your Trip",
    ja: "オーダーメイド旅程を相談する",
  },
  ctaNote: {
    en: "No obligation · Free itinerary revisions until every detail is perfect",
    ja: "相談無料 · ご納得いただけるまで何度でもプラン修正可能",
  },
  inclusions: {
    en: [
      "Private air-conditioned vehicle with dedicated English or Japanese speaking chauffeur-guide",
      "Handpicked accommodation with daily breakfast (3-star to 5-star luxury)",
      "All government taxes, highway tolls, and parking fees",
      "24/7 on-trip WhatsApp & phone concierge assistance",
    ],
    ja: [
      "専用エアコン付き車両（英語または日本語対応ドライバー兼ガイド同行）",
      "厳選宿泊施設および毎日の朝食（3つ星〜5つ星ラグジュアリーまで選択可）",
      "各種税金、高速道路通行料、駐車場代すべて込み",
      "ご旅行中の24時間日本語・英語コンシェルジュサポート",
    ],
  },
  exclusions: {
    en: [
      "International airfare and Sri Lanka ETA visa fees",
      "Monument entrance tickets & national park safari jeep fees (unless specified)",
      "Personal travel insurance, lunches, dinners, and gratuities",
    ],
    ja: [
      "国際線航空券およびスリランカETA（電子渡航認証）申請費用",
      "遺跡入場料および国立公園サファリジープ代（プラン明記の場合を除く）",
      "海外旅行保険、昼食・夕食代、チップなどの個人的費用",
    ],
  },
  pricingNotes: {
    en: [
      "30% deposit secures all hotel and vehicle reservations; remaining balance is due 14 days before arrival.",
      "Peak season supplements (Dec 20 – Jan 10 & Jul – Aug) apply at select hill-country & beach resorts.",
      "Group discounts of 10%–18% are automatically applied for parties of 6 or more guests.",
    ],
    ja: [
      "ご予約確定時に総額の30%をデポジットとしてお支払いいただき、残金はご到着14日前までにお支払いください。",
      "年末年始（12/20〜1/10）および夏季（7〜8月）は一部リゾートにてピークシーズン追加料金が発生します。",
      "6名様以上のグループでお申し込みの場合、10%〜18%の団体割引が自動適用されます。",
    ],
  },
};

export const INITIAL_TRANSFER_RATES: TransferPricingConfig = {
  titleBase: {
    en: "Airport & Intercity",
    ja: "空港・都市間送迎",
  },
  titleAccent: {
    en: "Transfer Rates",
    ja: "料金・ご案内",
  },
  subtitleStrong: {
    en: "Fixed-rate private transfers with flight tracking",
    ja: "フライト追跡付き・定額プライベート送迎",
  },
  subtitle: {
    en: "Direct, comfortable private transfers between Bandaranaike International Airport (CMB) and all major destinations across Sri Lanka.",
    ja: "バンダラナイケ国際空港（CMB）とスリランカ全土の主要都市・リゾート間を快適に直行する専用車送迎サービスです。",
  },
  popularBadge: {
    en: "Airport Pick-up Guarantee",
    ja: "安心の空港お迎え保証",
  },
  popularTitle: {
    en: "VIP Meet & Greet in Arrivals Hall",
    ja: "到着ロビーでのネームボードお出迎え",
  },
  popularDesc: {
    en: "Our driver waits with your name board inside the terminal. Includes complimentary 60-minute wait time from actual landing.",
    ja: "到着ゲートにてお客様のネームボードを持ったドライバーがお待ちします。実際の着陸から60分間の無料待機が含まれます。",
  },
  notes: {
    en: [
      "All transfer prices include air-conditioned vehicle, professional chauffeur, fuel, expressway highway tolls, and parking tickets.",
      "Flight arrival time is tracked in real-time; complimentary 60-minute wait time begins upon confirmed flight touchdown.",
      "Luggage capacity guide: Sedans accommodate 2 adults + 2 large suitcases; Vans accommodate up to 6 adults + 6 suitcases.",
      "Baby seats, child booster seats, and extra stops along the direct route are available upon advance notification.",
    ],
    ja: [
      "すべての送迎料金に、エアコン完備車両、専属ドライバー、燃料代、高速道路料金、空港駐車場代が含まれています。",
      "フライトの到着状況をリアルタイムで追跡し、実際の着陸時間から最大60分間の無料待機時間を設けています。",
      "お荷物目安：セダンは大人2名＋大型スーツケース2個、ミニバンは大人6名＋スーツケース6個まで積載可能です。",
      "チャイルドシートのご用意や、直行ルート上の途中立ち寄り（スーパー・両替等）は事前リクエストにて対応可能です。",
    ],
  },
};

