import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseAdmin = null;
let supabaseClient = null;

if (env.SUPABASE_URL && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)) {
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  supabaseAdmin = createClient(env.SUPABASE_URL, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY || serviceKey);
  console.log('✅ Supabase client initialized successfully.');
} else {
  console.log('ℹ️ Supabase credentials not fully configured. Using fallback local repository for testing/offline mode.');
}

export { supabaseAdmin, supabaseClient };
