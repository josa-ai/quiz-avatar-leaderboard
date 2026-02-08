import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://sxqbakawsirjyirkajxx.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlMWQzNDQ4LTdiMTctNDY5MC04ZmQ2LWY0NmM4MzcxOWE3OSJ9.eyJwcm9qZWN0SWQiOiJzeHFiYWthd3Npcmp5aXJrYWp4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY4MzIxNzE2LCJleHAiOjIwODM2ODE3MTYsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.lxVRZTGHwdgFXqZ9-twOg07ZzeuRDVEaYjEwge2-_Xg';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };