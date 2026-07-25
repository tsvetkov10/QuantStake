import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

export const isMockMode = !rawUrl || rawUrl.includes('mock') || !rawKey || rawKey.includes('mock');

const supabaseUrl = rawUrl || 'https://mock.supabase.co';
const supabaseKey = rawKey || 'mock-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
