import { Map } from './components/Map/Map';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="app dark:bg-gray-900">
        <Map />
      </div>
    </ThemeProvider>
  );
}

export default App;
