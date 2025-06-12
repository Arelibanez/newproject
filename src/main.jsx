import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import BudgetPage from './components/BudgetPage.jsx'
import ShoppingListPage from './components/ShoppingListPage.jsx'; // Importa la nuova pagina

// Componente per la navigazione
function Navigation() {
  const location = useLocation();
  const getLinkClass = (path) => {
    return location.pathname === path
      ? "bg-pink-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-pink-600 transition-all duration-300 ease-in-out text-sm sm:text-base transform hover:scale-105"
      : "bg-pink-200 text-pink-700 px-4 py-2 rounded-md shadow-sm hover:bg-pink-300 hover:text-white transition-all duration-300 ease-in-out text-sm sm:text-base transform hover:scale-105";
  };

  return (
    <nav className="bg-pink-100 p-4 shadow-lg sticky top-0 z-50">
      <ul className="container mx-auto flex flex-wrap justify-center items-center space-x-4 sm:space-x-6">
        <li>
          <Link to="/" className={getLinkClass('/')}>Le mie attività</Link>
        </li>
        <li>
          <Link to="/budget" className={getLinkClass('/budget')}>Gestione Budget</Link>
        </li>
        <li>
          <Link to="/shopping-list" className={getLinkClass('/shopping-list')}>Lista Spesa</Link> {/* Nuovo link */}      
        </li>
      </ul>
    </nav>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/shopping-list" element={<ShoppingListPage />} /> {/* Nuova rotta */}
      </Routes>
    </Router>
  </StrictMode>,
)
