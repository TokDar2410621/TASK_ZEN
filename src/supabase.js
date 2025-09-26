import { createClient } from '@supabase/supabase-js'

// Cette ligne lit l'URL de votre projet Supabase depuis vos variables d'environnement.
// En local, elle viendra du fichier .env.local. Sur Vercel, elle viendra des paramètres du projet.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

// Cette ligne fait la même chose pour votre clé d'accès sécurisée (anon key).
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cette ligne crée le client de connexion Supabase et l'exporte pour que
// le reste de votre application (App.vue, Auth.vue) puisse l'utiliser.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
