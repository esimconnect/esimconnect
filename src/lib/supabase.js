import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://caiyjwcvwnquqfwoozjm.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhaXlqd2N2d25xdXFmd29vemptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDk2MjcsImV4cCI6MjA4ODYyNTYyN30.nJyTatVhMTyXCrICUQQ3koCl-qnTeN4F1OgnXEIVcFU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
