// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fezlyliscqqgjngvdsty.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlemx5bGlzY3FxZ2puZ3Zkc3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTM3MTksImV4cCI6MjA2NTk4OTcxOX0.ng0wl4a7dyPwQ4npBHZK8IL0Ow_hGLdBuRGFmMrFNMA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);