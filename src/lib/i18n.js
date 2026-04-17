// src/lib/i18n.js
// esimconnect — Language context + translations
// Languages: EN | 中文 | 日本語 | 한국어

import React, { createContext, useContext, useState } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'EN',   flag: '🇬🇧', name: 'English'  },
  { code: 'zh', label: '中文', flag: '🇨🇳', name: '中文'     },
  { code: 'ja', label: '日本語', flag: '🇯🇵', name: '日本語'  },
  { code: 'ko', label: '한국어', flag: '🇰🇷', name: '한국어'  },
];

const translations = {
  // ─────────────────────────── ENGLISH ───────────────────────────
  en: {
    // Navbar
    nav_plans:        'Plans',
    nav_itinerary:    'My Itinerary',
    nav_purchases:    'My Purchases',
    nav_dashboard:    'Dashboard',
    nav_wallet:       'Wallet',
    nav_login:        'Login',
    nav_register:     'Register',
    nav_logout:       'Logout',

    // Home
    home_hero_title:  'Stay Connected Everywhere',
    home_hero_sub:    'Instant eSIM plans for 190+ countries. No SIM swaps, no roaming surprises.',
    home_cta_browse:  'Browse Plans',
    home_cta_trip:    'Plan My Trip',

    // Plans
    plans_title:      'eSIM Plans',
    plans_search:     'Search country…',
    plans_data:       'Data',
    plans_validity:   'Validity',
    plans_days:       'days',
    plans_buy:        'Buy Now',
    plans_no_results: 'No plans found.',

    // Checkout
    checkout_title:   'Checkout',
    checkout_summary: 'Order Summary',
    checkout_gst:     'GST (9%)',
    checkout_total:   'Total',
    checkout_wallet:  'Pay with eWallet',
    checkout_card:    'Pay with Card',
    checkout_balance: 'Balance',
    checkout_pay:     'Pay Now',
    checkout_topup:   'Top Up Wallet',
    checkout_insufficient: 'Insufficient wallet balance.',

    // Dashboard
    dash_title:       'Dashboard',
    dash_welcome:     'Welcome back',
    dash_balance:     'Wallet Balance',
    dash_topup:       'Top Up',
    dash_recent:      'Recent Orders',
    dash_no_orders:   'No orders yet.',
    dash_view_all:    'View All',

    // Wallet
    wallet_title:     'eWallet',
    wallet_balance:   'Your Balance',
    wallet_topup:     'Top Up',
    wallet_amount:    'Select Amount',
    wallet_custom:    'Other Amount',
    wallet_pay:       'Proceed to Pay',
    wallet_success:   'Top-up successful!',
    wallet_history:   'Top-up History',

    // Itinerary
    itin_title:       'My Itinerary',
    itin_destination: 'Where are you going?',
    itin_dates:       'Travel dates',
    itin_interests:   'Your interests',
    itin_generate:    'Generate Itinerary',
    itin_saved:       'Saved Itineraries',
    itin_no_saved:    'No saved itineraries yet.',

    // Purchases
    purchases_title:  'My Purchases',
    purchases_empty:  'No purchases yet.',
    purchases_order:  'Order',
    purchases_status: 'Status',
    purchases_date:   'Date',

    // Find Order
    find_title:       'Find My Order',
    find_email:       'Email address',
    find_code:        'Order code',
    find_search:      'Find Order',
    find_not_found:   'Order not found.',

    // Order Confirmation
    confirm_title:    'Order Confirmed!',
    confirm_sub:      'Your eSIM is ready to activate.',
    confirm_order:    'Order Code',
    confirm_iccid:    'ICCID',
    confirm_qr:       'Scan QR to activate',

    // Auth
    auth_email:       'Email',
    auth_password:    'Password',
    auth_name:        'Full Name',
    auth_login:       'Log In',
    auth_register:    'Create Account',
    auth_no_account:  "Don't have an account?",
    auth_have_account:'Already have an account?',
    auth_forgot:      'Forgot password?',

    // General
    loading:          'Loading…',
    error:            'Something went wrong.',
    save:             'Save',
    cancel:           'Cancel',
    close:            'Close',
    back:             'Back',
    days:             'days',
    gb:               'GB',
    sgd:              'SGD',
    status_completed: 'Completed',
    status_pending:   'Pending',
    status_failed:    'Failed',
  },

  // ─────────────────────────── 中文 ───────────────────────────
  zh: {
    nav_plans:        '套餐',
    nav_itinerary:    '我的行程',
    nav_purchases:    '我的订单',
    nav_dashboard:    '控制台',
    nav_wallet:       '钱包',
    nav_login:        '登录',
    nav_register:     '注册',
    nav_logout:       '退出登录',

    home_hero_title:  '随时随地保持连接',
    home_hero_sub:    '覆盖190多个国家的即时eSIM套餐，无需换卡，无漫游惊喜。',
    home_cta_browse:  '浏览套餐',
    home_cta_trip:    '规划行程',

    plans_title:      'eSIM 套餐',
    plans_search:     '搜索国家…',
    plans_data:       '流量',
    plans_validity:   '有效期',
    plans_days:       '天',
    plans_buy:        '立即购买',
    plans_no_results: '未找到套餐。',

    checkout_title:   '结账',
    checkout_summary: '订单摘要',
    checkout_gst:     '消费税 (9%)',
    checkout_total:   '合计',
    checkout_wallet:  '使用电子钱包支付',
    checkout_card:    '使用银行卡支付',
    checkout_balance: '余额',
    checkout_pay:     '立即支付',
    checkout_topup:   '充值钱包',
    checkout_insufficient: '钱包余额不足。',

    dash_title:       '控制台',
    dash_welcome:     '欢迎回来',
    dash_balance:     '钱包余额',
    dash_topup:       '充值',
    dash_recent:      '最近订单',
    dash_no_orders:   '暂无订单。',
    dash_view_all:    '查看全部',

    wallet_title:     '电子钱包',
    wallet_balance:   '您的余额',
    wallet_topup:     '充值',
    wallet_amount:    '选择金额',
    wallet_custom:    '自定义金额',
    wallet_pay:       '前往支付',
    wallet_success:   '充值成功！',
    wallet_history:   '充值记录',

    itin_title:       '我的行程',
    itin_destination: '您要去哪里？',
    itin_dates:       '出行日期',
    itin_interests:   '您的兴趣',
    itin_generate:    '生成行程',
    itin_saved:       '已保存行程',
    itin_no_saved:    '暂无已保存行程。',

    purchases_title:  '我的订单',
    purchases_empty:  '暂无订单。',
    purchases_order:  '订单',
    purchases_status: '状态',
    purchases_date:   '日期',

    find_title:       '查找订单',
    find_email:       '电子邮箱',
    find_code:        '订单号',
    find_search:      '查询订单',
    find_not_found:   '未找到订单。',

    confirm_title:    '订单已确认！',
    confirm_sub:      '您的eSIM已准备好激活。',
    confirm_order:    '订单号',
    confirm_iccid:    'ICCID',
    confirm_qr:       '扫码激活',

    auth_email:       '邮箱',
    auth_password:    '密码',
    auth_name:        '姓名',
    auth_login:       '登录',
    auth_register:    '创建账户',
    auth_no_account:  '没有账户？',
    auth_have_account:'已有账户？',
    auth_forgot:      '忘记密码？',

    loading:          '加载中…',
    error:            '出错了。',
    save:             '保存',
    cancel:           '取消',
    close:            '关闭',
    back:             '返回',
    days:             '天',
    gb:               'GB',
    sgd:              'SGD',
    status_completed: '已完成',
    status_pending:   '处理中',
    status_failed:    '失败',
  },

  // ─────────────────────────── 日本語 ───────────────────────────
  ja: {
    nav_plans:        'プラン',
    nav_itinerary:    '旅程',
    nav_purchases:    '購入履歴',
    nav_dashboard:    'ダッシュボード',
    nav_wallet:       'ウォレット',
    nav_login:        'ログイン',
    nav_register:     '新規登録',
    nav_logout:       'ログアウト',

    home_hero_title:  'どこでも繋がり続けよう',
    home_hero_sub:    '190カ国以上に対応した即時eSIMプラン。SIM交換不要、ローミング不要。',
    home_cta_browse:  'プランを見る',
    home_cta_trip:    '旅を計画する',

    plans_title:      'eSIMプラン',
    plans_search:     '国を検索…',
    plans_data:       'データ量',
    plans_validity:   '有効期間',
    plans_days:       '日間',
    plans_buy:        '今すぐ購入',
    plans_no_results: 'プランが見つかりません。',

    checkout_title:   'チェックアウト',
    checkout_summary: '注文概要',
    checkout_gst:     '消費税 (9%)',
    checkout_total:   '合計',
    checkout_wallet:  'eウォレットで支払う',
    checkout_card:    'カードで支払う',
    checkout_balance: '残高',
    checkout_pay:     '今すぐ支払う',
    checkout_topup:   'ウォレットをチャージ',
    checkout_insufficient: 'ウォレットの残高が不足しています。',

    dash_title:       'ダッシュボード',
    dash_welcome:     'おかえりなさい',
    dash_balance:     'ウォレット残高',
    dash_topup:       'チャージ',
    dash_recent:      '最近の注文',
    dash_no_orders:   'まだ注文はありません。',
    dash_view_all:    'すべて見る',

    wallet_title:     'eウォレット',
    wallet_balance:   '残高',
    wallet_topup:     'チャージ',
    wallet_amount:    '金額を選択',
    wallet_custom:    'その他の金額',
    wallet_pay:       '支払いへ進む',
    wallet_success:   'チャージが完了しました！',
    wallet_history:   'チャージ履歴',

    itin_title:       '旅程',
    itin_destination: 'どこへ行きますか？',
    itin_dates:       '旅行日程',
    itin_interests:   '興味・関心',
    itin_generate:    '旅程を作成する',
    itin_saved:       '保存した旅程',
    itin_no_saved:    'まだ保存された旅程はありません。',

    purchases_title:  '購入履歴',
    purchases_empty:  'まだ購入履歴はありません。',
    purchases_order:  '注文',
    purchases_status: 'ステータス',
    purchases_date:   '日付',

    find_title:       '注文を探す',
    find_email:       'メールアドレス',
    find_code:        '注文コード',
    find_search:      '注文を検索',
    find_not_found:   '注文が見つかりません。',

    confirm_title:    '注文が確定しました！',
    confirm_sub:      'eSIMの有効化の準備が整いました。',
    confirm_order:    '注文コード',
    confirm_iccid:    'ICCID',
    confirm_qr:       'QRコードをスキャンして有効化',

    auth_email:       'メールアドレス',
    auth_password:    'パスワード',
    auth_name:        '氏名',
    auth_login:       'ログイン',
    auth_register:    'アカウント作成',
    auth_no_account:  'アカウントをお持ちでないですか？',
    auth_have_account:'すでにアカウントをお持ちですか？',
    auth_forgot:      'パスワードをお忘れですか？',

    loading:          '読み込み中…',
    error:            'エラーが発生しました。',
    save:             '保存',
    cancel:           'キャンセル',
    close:            '閉じる',
    back:             '戻る',
    days:             '日',
    gb:               'GB',
    sgd:              'SGD',
    status_completed: '完了',
    status_pending:   '処理中',
    status_failed:    '失敗',
  },

  // ─────────────────────────── 한국어 ───────────────────────────
  ko: {
    nav_plans:        '플랜',
    nav_itinerary:    '내 일정',
    nav_purchases:    '구매 내역',
    nav_dashboard:    '대시보드',
    nav_wallet:       '지갑',
    nav_login:        '로그인',
    nav_register:     '회원가입',
    nav_logout:       '로그아웃',

    home_hero_title:  '어디서나 연결되세요',
    home_hero_sub:    '190개국 이상의 즉시 eSIM 플랜. SIM 교체 없이, 로밍 걱정 없이.',
    home_cta_browse:  '플랜 보기',
    home_cta_trip:    '여행 계획하기',

    plans_title:      'eSIM 플랜',
    plans_search:     '국가 검색…',
    plans_data:       '데이터',
    plans_validity:   '유효 기간',
    plans_days:       '일',
    plans_buy:        '지금 구매',
    plans_no_results: '플랜을 찾을 수 없습니다.',

    checkout_title:   '결제',
    checkout_summary: '주문 요약',
    checkout_gst:     'GST (9%)',
    checkout_total:   '합계',
    checkout_wallet:  'eWallet로 결제',
    checkout_card:    '카드로 결제',
    checkout_balance: '잔액',
    checkout_pay:     '지금 결제',
    checkout_topup:   '지갑 충전',
    checkout_insufficient: '지갑 잔액이 부족합니다.',

    dash_title:       '대시보드',
    dash_welcome:     '다시 오신 것을 환영합니다',
    dash_balance:     '지갑 잔액',
    dash_topup:       '충전',
    dash_recent:      '최근 주문',
    dash_no_orders:   '아직 주문이 없습니다.',
    dash_view_all:    '전체 보기',

    wallet_title:     'eWallet',
    wallet_balance:   '잔액',
    wallet_topup:     '충전',
    wallet_amount:    '금액 선택',
    wallet_custom:    '직접 입력',
    wallet_pay:       '결제 진행',
    wallet_success:   '충전이 완료되었습니다!',
    wallet_history:   '충전 내역',

    itin_title:       '내 일정',
    itin_destination: '어디로 가시나요?',
    itin_dates:       '여행 날짜',
    itin_interests:   '관심사',
    itin_generate:    '일정 생성',
    itin_saved:       '저장된 일정',
    itin_no_saved:    '아직 저장된 일정이 없습니다.',

    purchases_title:  '구매 내역',
    purchases_empty:  '아직 구매 내역이 없습니다.',
    purchases_order:  '주문',
    purchases_status: '상태',
    purchases_date:   '날짜',

    find_title:       '주문 찾기',
    find_email:       '이메일 주소',
    find_code:        '주문 코드',
    find_search:      '주문 찾기',
    find_not_found:   '주문을 찾을 수 없습니다.',

    confirm_title:    '주문이 확인되었습니다!',
    confirm_sub:      'eSIM을 활성화할 준비가 되었습니다.',
    confirm_order:    '주문 코드',
    confirm_iccid:    'ICCID',
    confirm_qr:       'QR 코드를 스캔하여 활성화',

    auth_email:       '이메일',
    auth_password:    '비밀번호',
    auth_name:        '이름',
    auth_login:       '로그인',
    auth_register:    '계정 만들기',
    auth_no_account:  '계정이 없으신가요?',
    auth_have_account:'이미 계정이 있으신가요?',
    auth_forgot:      '비밀번호를 잊으셨나요?',

    loading:          '로딩 중…',
    error:            '오류가 발생했습니다.',
    save:             '저장',
    cancel:           '취소',
    close:            '닫기',
    back:             '뒤로',
    days:             '일',
    gb:               'GB',
    sgd:              'SGD',
    status_completed: '완료',
    status_pending:   '처리 중',
    status_failed:    '실패',
  },
};

// ─────────────────────────── Context ───────────────────────────

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const saved = localStorage.getItem('esimconnect_lang') || 'en';
  const [lang, setLangState] = useState(saved);

  function setLang(code) {
    setLangState(code);
    localStorage.setItem('esimconnect_lang', code);
  }

  // t('key') — returns translated string, falls back to EN then key itself
  function t(key) {
    return (
      translations[lang]?.[key] ??
      translations['en']?.[key] ??
      key
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─────────────────────────── Hook ───────────────────────────

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}
