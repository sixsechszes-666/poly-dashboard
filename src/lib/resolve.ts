import { api } from '../api/polymarket'
import type { ProfileSearchResult } from '../types'

const ADDR_RE = /0x[a-fA-F0-9]{40}/

export type ResolveResult =
  | { kind: 'address'; address: string }
  | { kind: 'choices'; choices: ProfileSearchResult[] }
  | { kind: 'notfound' }

/**
 * Turns whatever the user pastes into a wallet address.
 * Handles: raw 0x address, polymarket.com/profile/0x... links,
 * polymarket.com/@username links, and bare usernames.
 */
export async function resolveTrader(input: string): Promise<ResolveResult> {
  const trimmed = input.trim()
  if (!trimmed) return { kind: 'notfound' }

  // A link or string that already contains an address.
  const m = trimmed.match(ADDR_RE)
  if (m) return { kind: 'address', address: m[0].toLowerCase() }

  // Otherwise treat the tail after the last "@" or "/" as a username.
  const name = trimmed
    .replace(/\/+$/, '')
    .replace(/^.*[@/]/, '')
    .trim()
  if (!name) return { kind: 'notfound' }

  const { profiles } = await api.searchProfiles(name)
  if (!profiles || profiles.length === 0) return { kind: 'notfound' }

  const exact = profiles.filter(
    (p) => p.name.toLowerCase() === name.toLowerCase(),
  )
  if (exact.length === 1) {
    return { kind: 'address', address: exact[0].proxyWallet.toLowerCase() }
  }
  return { kind: 'choices', choices: profiles }
}
