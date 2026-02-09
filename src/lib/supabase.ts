import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://xfhlpfjbrrlmxpdtkkbf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaGxwZmpicnJsbXhwZHRra2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1OTQzMzgsImV4cCI6MjA4NjE3MDMzOH0.DSPBgthK__8Qh9w16hB8ro9zQs8CM0lqBLLcDpvWofc';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };