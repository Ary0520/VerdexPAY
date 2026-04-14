import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Fetch profile by wallet address
export async function getProfileByAddress(address) {
  const lower = address.toLowerCase()
  console.log('[getProfileByAddress] querying for:', lower)
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', lower)
    .maybeSingle()
  console.log('[getProfileByAddress] result:', data, 'error:', error)
  return data
}

// Resolve @handle → wallet address
export async function resolveHandle(handle) {
  const clean = handle.replace(/^@/, '').toLowerCase()
  const { data } = await supabase
    .from('users')
    .select('wallet_address, username, display_name, avatar_url')
    .ilike('username', clean)
    .maybeSingle()   // returns null instead of 406 when no row found
  return data
}

// Check if username is taken
export async function isUsernameTaken(username) {
  const { data } = await supabase
    .from('users')
    .select('id')
    .ilike('username', username.replace(/^@/, ''))
    .single()
  return !!data
}

// Upload avatar to Supabase Storage and return public URL
export async function uploadAvatar(walletAddress, file) {
  const ext  = file.name.split('.').pop().toLowerCase()
  const path = `${walletAddress.toLowerCase()}.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // cache-bust so the browser doesn't show the old image
  return `${data.publicUrl}?t=${Date.now()}`
}

// Update a single field on the profile
export async function updateProfile(walletAddress, fields) {
  const { data, error } = await supabase
    .from('users')
    .update(fields)
    .eq('wallet_address', walletAddress.toLowerCase())
    .select()
    .single()
  if (error) throw error
  return data
}
export async function upsertProfile({ walletAddress, username, displayName, avatarUrl }) {
  const address = walletAddress.toLowerCase()
  const uname   = username.toLowerCase().replace(/^@/, '')

  // Check if a row already exists for this wallet
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', address)
    .maybeSingle()

  if (existing) {
    // Update existing row
    const { data, error } = await supabase
      .from('users')
      .update({ username: uname, display_name: displayName ?? null, avatar_url: avatarUrl ?? null })
      .eq('wallet_address', address)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    // Insert new row
    const { data, error } = await supabase
      .from('users')
      .insert({ wallet_address: address, username: uname, display_name: displayName ?? null, avatar_url: avatarUrl ?? null })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

// React hook — auto-fetches profile for the logged-in wallet
export function useUserProfile(walletAddress) {
  const [profile,    setProfile]    = useState(null)
  const [hasProfile, setHasProfile] = useState(false)
  // Track which address we've completed a fetch for
  const [fetchedFor, setFetchedFor] = useState(null)

  const fetch = useCallback(async () => {
    if (!walletAddress) return
    try {
      const data = await getProfileByAddress(walletAddress)
      setProfile(data)
      setHasProfile(!!data)
    } finally {
      setFetchedFor(walletAddress.toLowerCase())
    }
  }, [walletAddress])

  useEffect(() => { fetch() }, [fetch])

  // loading = true until we've completed a fetch for the CURRENT address
  const loading = !walletAddress
    ? false
    : fetchedFor !== walletAddress.toLowerCase()

  return { profile, loading, hasProfile, refetch: fetch }
}
