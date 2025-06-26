/**
 * Main App component with routing and authentication setup
 */

import { HashRouter, Route, Routes } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Home from './pages/Home';

/**
 * Root application component
 */
export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <Routes>
            <Route path="/*" element={<Home />} />
          </Routes>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
}
