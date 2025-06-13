import React, { useState, useEffect } from 'react';

function BudgetPage() {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (expenseName.trim() === '' || expenseAmount.trim() === '') return;
    setExpenses([...expenses, { id: Date.now(), name: expenseName, amount: parseFloat(expenseAmount) }]);
    setExpenseName('');
    setExpenseAmount('');
  };

  const handleDeleteExpense = (expenseId) => {
    setExpenses(expenses.filter(expense => expense.id !== expenseId));
  };

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const remainingBalance = parseFloat(income || 0) - totalExpenses;
  const savingsProgress = savingsGoal ? (remainingBalance / parseFloat(savingsGoal)) * 100 : 0;

  // Load data from local storage
  useEffect(() => {
    const storedIncome = localStorage.getItem('budgetIncome');
    const storedExpenses = localStorage.getItem('budgetExpenses');
    const storedSavingsGoal = localStorage.getItem('budgetSavingsGoal');
    if (storedIncome) setIncome(storedIncome);
    if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
    if (storedSavingsGoal) setSavingsGoal(storedSavingsGoal);
  }, []);

  // Save data to local storage
  useEffect(() => {
    localStorage.setItem('budgetIncome', income);
  }, [income]);

  useEffect(() => {
    localStorage.setItem('budgetExpenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('budgetSavingsGoal', savingsGoal);
  }, [savingsGoal]);


  return (
    <div className="min-h-screen flex flex-col font-serif bg-pink-50 py-6 sm:py-10">
      <header className="w-full bg-pink-200 text-pink-800 py-4 shadow-md mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-center">Gestione Budget Mensile</h1>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center w-full">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md sm:max-w-2xl mx-4 sm:mx-0">
          {/* Income Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-pink-600">Il Mio Stipendio</h2>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="Inserisci il tuo stipendio mensile..."
              className="border-2 border-pink-200 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-pink-700 placeholder-pink-300"
            />
          </section>

          {/* Savings Goal Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-pink-600">Obiettivo di Risparmio</h2>
            <input
              type="number"
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(e.target.value)}
              placeholder="Imposta un obiettivo di risparmio..."
              className="border-2 border-pink-200 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-pink-700 placeholder-pink-300"
            />
          </section>

          {/* Expenses Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-pink-600">Le Mie Spese</h2>
            <form onSubmit={handleAddExpense} className="mb-4">
              <div className="flex flex-col sm:flex-row sm:space-x-2 mb-3">
                <input
                  type="text"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  placeholder="Nome spesa..."
                  className="border-2 border-pink-200 rounded-md px-3 sm:px-4 py-2 w-full sm:flex-1 mb-2 sm:mb-0 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-pink-700 placeholder-pink-300"
                />
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="Importo..."
                  className="border-2 border-pink-200 rounded-md px-3 sm:px-4 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-pink-700 placeholder-pink-300"
                />
              </div>
              <button
                type="submit"
                className="bg-pink-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50 w-full text-sm sm:text-base"
              >
                Aggiungi Spesa
              </button>
            </form>
            <ul className="space-y-3">
              {expenses.map(expense => (
                <li
                  key={expense.id}
                  className="flex justify-between items-center p-3 border-2 border-pink-100 rounded-md bg-white hover:shadow-sm"
                >
                  <span className="text-pink-700">{expense.name}</span>
                  <div className="flex items-center">
                    <span className="text-pink-600 font-medium mr-4">€{expense.amount.toFixed(2)}</span>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-400 hover:text-red-600 focus:outline-none p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Summary Section */}
          <section className="bg-pink-100 p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-pink-700 text-center">Riepilogo Mensile</h2>
            <div className="space-y-3 sm:space-y-4">
              <p className="flex justify-between text-sm sm:text-base text-pink-600"><span>Stipendio:</span> <span className="font-medium">€{parseFloat(income || 0).toFixed(2)}</span></p>
              <p className="flex justify-between text-sm sm:text-base text-red-500"><span>Spese Totali:</span> <span className="font-medium">€{totalExpenses.toFixed(2)}</span></p>
              <hr className="border-pink-200 my-2 sm:my-3"/>
              <p className={`flex justify-between text-base sm:text-lg font-bold ${remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>Bilancio Rimanente:</span> 
                <span>€{remainingBalance.toFixed(2)}</span>
              </p>
              {savingsGoal > 0 && (
                <div className="mt-4 pt-3 sm:pt-4 border-t border-pink-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm sm:text-base text-pink-600">
                        Obiettivo Risparmio: <span className="font-semibold">€{parseFloat(savingsGoal).toFixed(2)}</span>
                    </p>
                    <p className="text-sm font-medium text-pink-700">
                        {Math.max(0, Math.min(100, savingsProgress)).toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-full bg-pink-200 rounded-full h-5 sm:h-6 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full flex items-center justify-center transition-all duration-500 ease-out"
                      style={{ width: `${Math.max(0, Math.min(100, savingsProgress))}%` }}
                    >
                      {/* Optional: Text inside bar if progress is high enough */}
                      {savingsProgress > 15 && (
                        <span className="text-xs sm:text-sm font-bold text-white px-2">
                          {Math.max(0, Math.min(100, savingsProgress)).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  {remainingBalance > 0 && savingsGoal > 0 && (
                    <p className="text-xs text-pink-500 mt-2">
                      {remainingBalance >= parseFloat(savingsGoal) 
                        ? <span className="text-green-600 font-semibold">🎉 Obiettivo raggiunto e superato!</span> 
                        : `Mancano €${(parseFloat(savingsGoal) - remainingBalance).toFixed(2)} per raggiungere l'obiettivo.`
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full bg-pink-200 text-pink-700 py-4 mt-auto shadow-inner">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Il Mio Organizer Personale. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}

export default BudgetPage;
