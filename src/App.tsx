import { Map } from './components/Map/Map';
import { ThemeProvider } from './contexts/ThemeContext';
import { MapProvider } from './contexts/MapContext';

function App() {
  return (
    <ThemeProvider>
      <MapProvider>
        <div className="app">
          <Map />
        </div>
      </MapProvider>
    </ThemeProvider>
  );
}

export default App;