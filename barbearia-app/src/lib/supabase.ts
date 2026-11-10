import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Atenção: Credenciais do Supabase não encontradas no ambiente.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
