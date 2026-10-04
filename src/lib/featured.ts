/*
 * Traders offered on first open, so the page lands on a finished card instead
 * of an empty screen. All three were picked from the live all-time leaderboard
 * on 2026-10-04 and scored with this card's own insight rules: each one is in
 * profit, sits at its PnL peak and grows over the last 30 days. RN1 comes out
 * of those rules with no weaknesses at all.
 *
 * Only the addresses are fixed here. Every number on the card is fetched live,
 * so the captions describe what the trader bets on, never today's figures.
 *
 * Rank and volume are read from the leaderboard's top 50, which is the most
 * that endpoint returns. A trader who slips out of it still renders fine, just
 * without those two fields.
 */

export interface FeaturedTrader {
  address: string
  name: string
  note: string
}

export const FEATURED_TRADERS: FeaturedTrader[] = [
  {
    address: '0x2005d16a84ceefa912d4e380cd32e7ff827875ea',
    name: 'RN1',
    note: 'теннис и футбол, ставки на матчи',
  },
  {
    address: '0x5268527977f700f9bf9b6d5cd843859e4e70135d',
    name: 'HomeRunHazard',
    note: 'американский спорт: NFL, NCAA',
  },
  {
    address: '0x511f9c771449162349795d17becf8b37031acbe1',
    name: 'Bigggggggg',
    note: 'политика и выборы',
  },
]
