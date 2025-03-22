import { Map } from './components/Map/Map';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <Map />
      </div>
    </ThemeProvider>
  );
}

export default App;
