import { Map } from './components/Map/Map';
import { ThemeProvider } from './contexts/ThemeContext';
// import { MapProvider } from './contexts/MapContext'; // No longer needed here
import { useAuth } from './contexts/AuthContext'; // Import useAuth
import { AuthForm } from './components/Auth/AuthForm'; // Import AuthForm

function App() {
  // Get session status from AuthContext
  const { session } = useAuth();

  return (
    <ThemeProvider>
      {/* Remove MapProvider wrapper */}
      <div className="app">
        {/* Conditionally render AuthForm or Map */}
        {!session ? (
          <AuthForm />
        ) : (
          <Map /> // Render Map directly if session exists
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;