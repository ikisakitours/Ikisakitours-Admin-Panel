import { LegalDocument } from "../types/legal.types";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data – mirrors the shape of the production IkiSaki Tours legal pages
// with multilingual (EN / JA) Record<string, string> fields and Lucide icon keys.
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_LEGAL_DOCUMENTS: LegalDocument[] = [
  // ── 1. Terms of Service ────────────────────────────────────────────────────
  {
    id: "terms",
    title: { en: "Terms of Service", ja: "利用規約" },
    eyebrow: { en: "Legal & Compliance", ja: "法的事項・コンプライアンス" },
    accent: "emerald",
    lastUpdated: "November 1, 2026",
    sections: [
      {
        id: "terms-s1",
        heading: { en: "Acceptance of Terms", ja: "規約への同意" },
        sectionIcon: "FileText",
        type: "paragraph",
        content: {
          en: "By accessing or using the IkiSaki Tours website and services you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access the service. These terms apply to all visitors, users, and others who access or use the service.",
          ja: "IkiSaki Toursのウェブサイトおよびサービスにアクセスまたは利用することにより、お客様は本利用規約に拘束されることに同意したものとみなされます。本規約のいずれかの部分に同意されない場合は、サービスにアクセスすることはできません。",
        },
        expanded: false,
      },
      {
        id: "terms-s2",
        heading: { en: "Service Description", ja: "サービス内容" },
        sectionIcon: "Globe",
        type: "checklist",
        subItems: [
          {
            id: "si-t2-1",
            body: {
              en: "Curated multi-day and one-day tour packages across Sri Lanka.",
              ja: "スリランカ各地の厳選された宿泊付き・日帰りツアーパッケージ。",
            },
          },
          {
            id: "si-t2-2",
            body: {
              en: "Chauffeur and transfer services with professional drivers.",
              ja: "プロのドライバーによる専用車・送迎サービス。",
            },
          },
          {
            id: "si-t2-3",
            body: {
              en: "Custom private itinerary planning and concierge support.",
              ja: "オーダーメイドのプライベート旅程作成とコンシェルジュサポート。",
            },
          },
          {
            id: "si-t2-4",
            body: {
              en: "Online booking management and real-time availability.",
              ja: "オンライン予約管理およびリアルタイムの空き状況確認。",
            },
          },
        ],
        expanded: false,
      },
      {
        id: "terms-s3",
        heading: { en: "User Responsibilities", ja: "お客様の責任" },
        sectionIcon: "User",
        type: "icon-list",
        subItems: [
          {
            id: "si-t3-1",
            icon: "CheckCircle2",
            title: { en: "Accurate Information", ja: "正確な情報の提供" },
            body: {
              en: "Provide truthful personal and payment details when booking.",
              ja: "ご予約時には正確な個人情報およびお支払い情報をご提供ください。",
            },
          },
          {
            id: "si-t3-2",
            icon: "Lock",
            title: { en: "Account Security", ja: "アカウントのセキュリティ" },
            body: {
              en: "Keep your login credentials confidential and notify us of any breach.",
              ja: "ログイン情報は厳重に管理し、不正利用の疑いがある場合は速やかにご連絡ください。",
            },
          },
          {
            id: "si-t3-3",
            icon: "Users",
            title: { en: "Respectful Conduct", ja: "節度ある行動" },
            body: {
              en: "Treat staff, guides, and other travellers with courtesy.",
              ja: "スタッフ、ガイド、他の旅行者に対して礼儀正しく接してください。",
            },
          },
          {
            id: "si-t3-4",
            icon: "ScrollText",
            title: { en: "Legal Compliance", ja: "法令遵守" },
            body: {
              en: "Comply with local Sri Lankan laws and customs at all times.",
              ja: "滞在中は常にスリランカの現地法令および慣習を遵守してください。",
            },
          },
        ],
        expanded: false,
      },
      {
        id: "terms-s4",
        heading: { en: "Limitation of Liability", ja: "責任の制限" },
        sectionIcon: "Scale",
        type: "paragraph",
        content: {
          en: "IkiSaki Tours shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use or inability to use the service. Our maximum liability in any circumstances shall not exceed the total amount paid by you for the specific booking in question.",
          ja: "IkiSaki Toursは、本サービスの利用または利用不能に起因する間接的、付随的、特別、結果的または懲罰的損害について責任を負いません。いかなる場合においても、当社の責任上限は該当予約に対してお客様がお支払いになった総額を超えないものとします。",
        },
        expanded: false,
      },
    ],
  },

  // ── 2. Privacy Policy ──────────────────────────────────────────────────────
  {
    id: "privacy",
    title: { en: "Privacy Policy", ja: "プライバシーポリシー" },
    eyebrow: { en: "Data & Privacy", ja: "データとプライバシー" },
    accent: "indigo",
    lastUpdated: "October 15, 2026",
    sections: [
      {
        id: "priv-s1",
        heading: { en: "Information We Collect", ja: "収集する情報" },
        sectionIcon: "Folder",
        type: "grid",
        subItems: [
          {
            id: "si-p1-1",
            title: { en: "Personal Details", ja: "個人情報" },
            body: {
              en: "Name, email, phone number, and passport/ID when booking.",
              ja: "ご予約時の氏名、メールアドレス、電話番号、パスポート/ID情報。",
            },
          },
          {
            id: "si-p1-2",
            title: { en: "Payment Data", ja: "決済データ" },
            body: {
              en: "Encrypted credit/debit card details processed via secure gateways.",
              ja: "安全な決済ゲートウェイを通じて暗号化処理されるカード情報。",
            },
          },
          {
            id: "si-p1-3",
            title: { en: "Usage Data", ja: "利用データ" },
            body: {
              en: "IP address, browser type, pages visited, and session duration.",
              ja: "IPアドレス、ブラウザの種類、閲覧ページ、セッション時間。",
            },
          },
          {
            id: "si-p1-4",
            title: { en: "Location Data", ja: "位置情報" },
            body: {
              en: "Approximate location for personalised itinerary recommendations.",
              ja: "最適な旅程提案のための概略的な位置情報。",
            },
          },
        ],
        expanded: false,
      },
      {
        id: "priv-s2",
        heading: { en: "How We Use Your Data", ja: "データの利用目的" },
        sectionIcon: "Settings",
        type: "row-list",
        subItems: [
          {
            id: "si-p2-1",
            title: { en: "Booking Fulfilment", ja: "予約の履行" },
            body: {
              en: "Process reservations and send confirmation communications.",
              ja: "予約手続きの処理および確認メールの送信。",
            },
          },
          {
            id: "si-p2-2",
            title: { en: "Customer Support", ja: "カスタマーサポート" },
            body: {
              en: "Respond to enquiries and resolve service issues.",
              ja: "お問い合わせへの対応およびサービス上の問題の解決。",
            },
          },
          {
            id: "si-p2-3",
            title: { en: "Service Improvement", ja: "サービスの改善" },
            body: {
              en: "Analyse usage patterns to enhance platform features.",
              ja: "利用傾向の分析によるプラットフォーム機能の向上。",
            },
          },
          {
            id: "si-p2-4",
            title: { en: "Legal Obligations", ja: "法的義務の遵守" },
            body: {
              en: "Comply with applicable Sri Lankan and international laws.",
              ja: "適用されるスリランカおよび国際法令の遵守。",
            },
          },
        ],
        expanded: false,
      },
      {
        id: "priv-s3",
        heading: { en: "Contact Our DPO", ja: "データ保護責任者へのお問い合わせ" },
        sectionIcon: "Mail",
        type: "contact",
        subItems: [
          {
            id: "si-p3-1",
            icon: "Mail",
            title: { en: "Email", ja: "メール" },
            body: { en: "privacy@ikisakitours.com", ja: "privacy@ikisakitours.com" },
          },
          {
            id: "si-p3-2",
            icon: "Phone",
            title: { en: "Phone", ja: "電話番号" },
            body: { en: "+94 11 234 5678", ja: "+94 11 234 5678" },
          },
          {
            id: "si-p3-3",
            icon: "MapPin",
            title: { en: "Address", ja: "所在地" },
            body: {
              en: "No. 12 Galle Road, Colombo 03, Sri Lanka",
              ja: "No. 12 Galle Road, Colombo 03, Sri Lanka",
            },
          },
        ],
        expanded: false,
      },
    ],
  },

  // ── 3. Booking Policy ──────────────────────────────────────────────────────
  {
    id: "booking",
    title: { en: "Booking Policy", ja: "予約ポリシー" },
    eyebrow: { en: "Reservations", ja: "ご予約について" },
    accent: "blue",
    lastUpdated: "September 20, 2026",
    sections: [
      {
        id: "book-s1",
        heading: { en: "Reservation Process", ja: "ご予約の流れ" },
        sectionIcon: "Calendar",
        type: "row-list",
        subItems: [
          {
            id: "si-b1-1",
            title: { en: "Step 1 – Select Package", ja: "ステップ1 – パッケージ選択" },
            body: {
              en: "Browse and choose your preferred tour package or service.",
              ja: "ご希望のツアーパッケージまたはサービスをお選びください。",
            },
          },
          {
            id: "si-b1-2",
            title: { en: "Step 2 – Choose Dates", ja: "ステップ2 – 日程選択" },
            body: {
              en: "Select available dates from the calendar and confirm party size.",
              ja: "カレンダーから空き日程を選び、参加人数をご指定ください。",
            },
          },
          {
            id: "si-b1-3",
            title: { en: "Step 3 – Enter Details", ja: "ステップ3 – お客様情報入力" },
            body: {
              en: "Provide passenger information and any special requirements.",
              ja: "参加者情報および特別なご要望をご入力ください。",
            },
          },
          {
            id: "si-b1-4",
            title: { en: "Step 4 – Pay & Confirm", ja: "ステップ4 – お支払い・確定" },
            body: {
              en: "Complete payment to receive your instant booking confirmation email.",
              ja: "お支払いを完了すると、予約確認メールが即時に届きます。",
            },
          },
        ],
        expanded: false,
      },
      {
        id: "book-s2",
        heading: { en: "Cancellation & Refunds", ja: "キャンセル・返金規定" },
        sectionIcon: "RefreshCw",
        type: "checklist",
        subItems: [
          {
            id: "si-b2-1",
            body: {
              en: "Cancellations made 14+ days prior: full refund minus a 5% processing fee.",
              ja: "14日前までのキャンセル：手数料5%を差し引いた全額を返金。",
            },
          },
          {
            id: "si-b2-2",
            body: {
              en: "Cancellations 7–13 days prior: 50% refund of the total booking value.",
              ja: "7〜13日前のキャンセル：予約総額の50%を返金。",
            },
          },
          {
            id: "si-b2-3",
            body: {
              en: "Cancellations within 7 days: no refund; credit note may be issued.",
              ja: "7日以内のキャンセル：返金不可（クレジットノートを発行する場合があります）。",
            },
          },
          {
            id: "si-b2-4",
            body: {
              en: "No-shows: non-refundable with no credit note issued.",
              ja: "無断キャンセル（ノーショー）：返金・クレジットノート発行ともに対象外。",
            },
          },
        ],
        expanded: false,
      },
    ],
  },

  // ── 4. Payment Policy ──────────────────────────────────────────────────────
  {
    id: "payment",
    title: { en: "Payment Policy", ja: "お支払いポリシー" },
    eyebrow: { en: "Payments & Billing", ja: "決済・請求" },
    accent: "amber",
    lastUpdated: "August 5, 2026",
    sections: [
      {
        id: "pay-s1",
        heading: { en: "Accepted Payment Methods", ja: "ご利用可能なお支払い方法" },
        sectionIcon: "CreditCard",
        type: "grid",
        subItems: [
          {
            id: "si-pay1-1",
            title: { en: "Credit / Debit Cards", ja: "クレジットカード・デビットカード" },
            body: {
              en: "Visa, MasterCard, and American Express accepted worldwide.",
              ja: "Visa、MasterCard、American Expressに対応しています。",
            },
          },
          {
            id: "si-pay1-2",
            title: { en: "Bank Transfer", ja: "銀行振込" },
            body: {
              en: "Direct transfers to our LKR or USD accounts. 2–3 business days.",
              ja: "LKRまたはUSD口座への直接振込（2〜3営業日）。",
            },
          },
          {
            id: "si-pay1-3",
            title: { en: "PayPal", ja: "PayPal" },
            body: {
              en: "Secure PayPal checkout for international guests.",
              ja: "海外のお客様向けの安全なPayPal決済。",
            },
          },
          {
            id: "si-pay1-4",
            title: { en: "Wise (TransferWise)", ja: "Wise（旧TransferWise）" },
            body: {
              en: "Low-fee international transfers in 40+ currencies.",
              ja: "40以上の通貨に対応した低手数料の国際送金。",
            },
          },
        ],
        expanded: false,
      },
      {
        id: "pay-s2",
        heading: { en: "Payment Schedule", ja: "お支払いスケジュール" },
        sectionIcon: "Calendar",
        type: "icon-list",
        subItems: [
          {
            id: "si-pay2-1",
            icon: "Bookmark",
            title: { en: "Deposit", ja: "予約金（デポジット）" },
            body: {
              en: "30% deposit required at the time of booking to secure your dates.",
              ja: "日程確保のため、ご予約時に総額の30%をお支払いいただきます。",
            },
          },
          {
            id: "si-pay2-2",
            icon: "Clock",
            title: { en: "Interim Payment", ja: "中間お支払い" },
            body: {
              en: "Additional 40% due 30 days before the tour departure date.",
              ja: "ツアー出発の30日前までに追加で40%をお支払いいただきます。",
            },
          },
          {
            id: "si-pay2-3",
            icon: "CheckCircle2",
            title: { en: "Final Balance", ja: "残金のお支払い" },
            body: {
              en: "Remaining 30% payable 7 days prior or on day of arrival.",
              ja: "残りの30%は出発7日前またはご到着当日にお支払いください。",
            },
          },
        ],
        expanded: false,
      },
    ],
  },

  // ── 5. Cookie Policy ──────────────────────────────────────────────────────
  {
    id: "cookie",
    title: { en: "Cookie Policy", ja: "クッキーポリシー" },
    eyebrow: { en: "Cookies & Tracking", ja: "Cookieとトラッキング" },
    accent: "rose",
    lastUpdated: "July 12, 2026",
    sections: [
      {
        id: "cook-s1",
        heading: { en: "What Are Cookies?", ja: "Cookieとは？" },
        sectionIcon: "Cookie",
        type: "paragraph",
        content: {
          en: "Cookies are small text files stored on your device when you visit our website. They help us remember your preferences, understand how you interact with our platform, and deliver relevant content and advertisements.",
          ja: "Cookieとは、ウェブサイトを訪問した際にお客様のデバイスに保存される小さなテキストファイルです。設定の記憶や利用状況の把握、適切なコンテンツの提供に役立ちます。",
        },
        expanded: false,
      },
      {
        id: "cook-s2",
        heading: { en: "Types of Cookies We Use", ja: "使用するCookieの種類" },
        sectionIcon: "Info",
        type: "grid",
        subItems: [
          {
            id: "si-c2-1",
            title: { en: "Essential Cookies", ja: "必須Cookie" },
            body: {
              en: "Required for the website to function correctly. Cannot be disabled.",
              ja: "ウェブサイトが正常に機能するために不可欠なCookieです（無効化不可）。",
            },
          },
          {
            id: "si-c2-2",
            title: { en: "Analytics Cookies", ja: "分析Cookie" },
            body: {
              en: "Track page views and user flows to improve our service (e.g. GA4).",
              ja: "サービス改善のためにページ閲覧数やユーザー動線を計測します（GA4など）。",
            },
          },
          {
            id: "si-c2-3",
            title: { en: "Preference Cookies", ja: "設定Cookie" },
            body: {
              en: "Remember your language and currency settings across visits.",
              ja: "言語や通貨の設定を次回訪問時にも記憶します。",
            },
          },
          {
            id: "si-c2-4",
            title: { en: "Marketing Cookies", ja: "マーケティングCookie" },
            body: {
              en: "Serve personalised ads on third-party platforms (opt-out available).",
              ja: "サードパーティプラットフォーム上でパーソナライズ広告を配信します（オプトアウト可能）。",
            },
          },
        ],
        expanded: false,
      },
      {
        id: "cook-s3",
        heading: { en: "Managing Your Preferences", ja: "Cookie設定の管理" },
        sectionIcon: "Settings",
        type: "checklist",
        subItems: [
          {
            id: "si-c3-1",
            body: {
              en: "Use the cookie banner on first visit to accept or reject non-essential cookies.",
              ja: "初回訪問時のCookieバナーから、必須以外のCookieを許可または拒否できます。",
            },
          },
          {
            id: "si-c3-2",
            body: {
              en: "Revisit your preferences at any time via the footer 'Cookie Settings' link.",
              ja: "フッターの「Cookie設定」リンクからいつでも設定を変更できます。",
            },
          },
          {
            id: "si-c3-3",
            body: {
              en: "Block cookies through your browser settings (may affect site functionality).",
              ja: "ブラウザの設定でCookieをブロックできます（一部機能に影響する場合があります）。",
            },
          },
        ],
        expanded: false,
      },
    ],
  },
];
