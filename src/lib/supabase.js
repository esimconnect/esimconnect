import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://emsovpcmdnuxrhbyvnvb.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_yDr3YTcsErOPthkWXjjRRw_R4AaB3zA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
