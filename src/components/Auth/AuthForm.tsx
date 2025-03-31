import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../services/supabaseClient'; // Import your client
import styles from './AuthForm.module.css'; // We'll create this CSS module next

export const AuthForm = () => {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h2 className={styles.authTitle}>Welcome to MapApp</h2>
        <p className={styles.authSubtitle}>Sign in or create an account to continue</p>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }} // Use the Supabase default theme
          providers={['google', 'github']} // Optional: Add social providers if configured
          theme="dark" // Optional: Specify 'dark' or 'light'
          // Optional: Add localization, view ('sign_in' or 'sign_up'), etc.
          // see: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui
        />
      </div>
    </div>
  );
}; 