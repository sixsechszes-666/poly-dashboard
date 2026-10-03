// Lightweight market categorisation from slug/title keywords — no extra API calls.

const RULES: [RegExp, string][] = [
  [
    /\b(nba|nfl|mlb|nhl|ncaa|epl|laliga|seriea|bundesliga|ucl|uefa|soccer|football|fifa|world-cup|worldcup|ufc|mma|boxing|tennis|atp|wta|f1|formula|golf|cricket|nascar|olympic)\b/i,
    'Спорт',
  ],
  [
    /\b(election|elections|president|presidential|senate|governor|congress|trump|biden|harris|vote|votes|poll|primary|parliament|democrat|republican|gop|cabinet|nominee|impeach)\b/i,
    'Политика',
  ],
  [
    /\b(btc|bitcoin|eth|ethereum|crypto|solana|\bsol\b|xrp|doge|altcoin|coinbase|binance|stablecoin)\b/i,
    'Крипто',
  ],
  [
    /\b(fed|rate|rates|inflation|cpi|gdp|recession|jobs|unemployment|economy|tariff|interest)\b/i,
    'Экономика',
  ],
  [
    /\b(oscar|oscars|grammy|emmy|movie|box-office|album|netflix|spotify|celebrity|award)\b/i,
    'Поп-культура',
  ],
  [
    /\b(ai|openai|gpt|nvidia|tesla|apple|google|spacex|tech|earnings|ipo)\b/i,
    'Технологии',
  ],
]

export function categorize(slug: string, title: string): string {
  const hay = `${slug} ${title}`.toLowerCase()
  for (const [re, cat] of RULES) {
    if (re.test(hay)) return cat
  }
  return 'Другое'
}
