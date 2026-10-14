import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://moylbwatqogafgrcudfj.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_waV7zVQ8bqDpfse3PlKtbg_Copp5Gu6'

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
)

