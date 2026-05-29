import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mfkisougkpdkfyoilrtd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ma2lzb3Vna3Bka2Z5b2lscnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDIyNDgsImV4cCI6MjA5NTU3ODI0OH0.nKsaVEB1_2mDKWawSAl0YwAtBDnKeZtctf3Tj_N56Qg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);