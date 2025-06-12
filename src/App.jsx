import React, { useState, useEffect } from 'react';
import './App.css';

// Helper function to format a Date object to 'YYYY-MM-DD' string in local time
const formatDateToYYYYMMDD = (dateObj) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

function App() {
  // Load tasks from local storage on initial render
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    // Ensure tasks have a priority, defaulting to 'Media' if not present
    return savedTasks ? JSON.parse(savedTasks).map(task => ({...task, priority: task.priority || 'Media'})) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState(''); // Stato para a data di scadenza
  const [newTaskPriority, setNewTaskPriority] = useState('Media'); // Stato per la priorità

  // Save tasks to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // todayString is already defined below, but we need it in addTask, so let's define it here or pass it.
  // For simplicity, let's re-calculate it or ensure it's accessible.
  // It's better to define it once and use it.
  // const todayString = formatDateToYYYYMMDD(new Date()); // Defined later, let's use the one defined in the component scope

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim() === '') return;

    const currentTodayString = formatDateToYYYYMMDD(new Date());

    if (newDueDate && newDueDate < currentTodayString) {
      alert("Non è possibile aggiungere attività per date passate.");
      return;
    }

    setTasks([...tasks, { id: Date.now(), text: newTask, completed: false, dueDate: newDueDate, priority: newTaskPriority }]);
    setNewTask('');
    setNewDueDate(''); // Resetta la data di scadenza
    setNewTaskPriority('Media'); // Resetta la priorità
  };

  const toggleComplete = (taskId) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 border-red-300 text-red-700';
      case 'Media':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'Bassa':
        return 'bg-green-100 border-green-300 text-green-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  // Funzione per formattare la data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  // Funzione per ottenere i prossimi 7 giorni
  const getNext7Days = () => {
    const days = [];
    const today = new Date(); // Usa la data corrente
    today.setHours(0, 0, 0, 0); // Normalizza all'inizio del giorno
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const upcomingDays = getNext7Days();
  // Use the new helper function for todayString to ensure local date 'YYYY-MM-DD'
  const todayString = formatDateToYYYYMMDD(new Date()); // Stringa per il confronto di oggi

  return (
    // Rimuovi min-h-screen e py-6/sm:py-10 dal div principale se la navigazione è esterna e gestisce il layout
    <div className="flex flex-col font-serif bg-pink-50">
      {/* Header rimosso, gestito globalmente o non necessario qui se c'è una nav bar */}
      {/* <header className="w-full bg-pink-200 text-pink-800 py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-center">Gestore Attività Femminile</h1>
        </div>
      </header> */}

      {/* Contenuto Principale */}
      <main className="flex-grow flex flex-col items-center w-full">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md sm:max-w-2xl mx-4 sm:mx-0"> 
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-pink-600">Le mie attività</h1>
          <form onSubmit={addTask} className="mb-6">
            <div className="flex flex-col sm:flex-row sm:space-x-2 mb-3">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Aggiungi una nuova attività..."
                className="border-2 border-pink-200 rounded-md sm:rounded-l-md sm:rounded-r-none px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 mb-2 sm:mb-0 text-pink-700 placeholder-pink-300"
              />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={todayString} // Aggiungi l'attributo min qui
                className="border-2 border-pink-200 rounded-md px-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-pink-700 placeholder-pink-300 bg-white mb-2 sm:mb-0"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="border-2 border-pink-200 rounded-md sm:rounded-r-md sm:rounded-l-none px-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-pink-700 bg-white"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Bassa">Bassa</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-pink-500 text-white px-6 py-2.5 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50 w-full text-sm sm:text-base"
            >
              Aggiungi Attività
            </button>
          </form>
          <ul className="space-y-3 mb-8">
            {tasks.map(task => (
              <li
                key={task.id}
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-2 rounded-md transition-all duration-300 ease-in-out ${
                  task.completed ? 'bg-pink-50 line-through text-pink-400 italic' : 'bg-white hover:shadow-md'
                } ${getPriorityClass(task.priority)}`}
              >
                <div onClick={() => toggleComplete(task.id)} className="cursor-pointer flex-grow mb-2 sm:mb-0">
                  <span>{task.text}</span>
                  {task.dueDate && (
                    <span className={`block text-xs mt-1 ${task.completed ? 'text-pink-300' : 'text-pink-500'}`}>
                      Scadenza: {formatDate(task.dueDate)}
                    </span>
                  )}
                  <span className={`block text-xs mt-1 font-semibold ${task.completed ? (task.priority === 'Alta' ? 'text-red-300' : task.priority === 'Media' ? 'text-yellow-300' : 'text-green-300') : (task.priority === 'Alta' ? 'text-red-600' : task.priority === 'Media' ? 'text-yellow-600' : 'text-green-600')}`}>
                    Priorità: {task.priority}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400 hover:text-red-600 focus:outline-none ml-4 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          {/* Sezione Panoramica Scadenze */} 
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center text-pink-500">Panoramica Scadenze</h2> {/* Rimosso (Prossimi 7 Giorni) per pulizia */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
              {upcomingDays.map(day => {
                // Use the new helper function for dayString to ensure local date 'YYYY-MM-DD'
                const dayString = formatDateToYYYYMMDD(day);
                const tasksForDay = tasks.filter(task => task.dueDate === dayString && !task.completed);
                const isToday = dayString === todayString;

                return (
                  <div 
                    key={dayString} 
                    className={`p-3 rounded-lg shadow-sm transition-all duration-300 ease-in-out 
                      ${isToday ? 'bg-pink-200 border-2 border-pink-400' : 'bg-pink-50 border border-pink-200 hover:shadow-md'}
                      ${tasksForDay.length > 0 && !isToday ? 'border-l-4 border-l-pink-500' : ''}
                      flex flex-col items-center text-center`}
                  >
                    <h3 className={`font-semibold text-sm mb-1 
                      ${isToday ? 'text-pink-700' : 'text-pink-600'}`}>
                      {day.toLocaleDateString('it-IT', { weekday: 'short' }).toUpperCase()} {/* Giorno della settimana abbreviato */}
                    </h3>
                    <p className={`text-2xl font-bold mb-2 
                      ${isToday ? 'text-pink-800' : 'text-pink-700'}`}>
                      {day.toLocaleDateString('it-IT', { day: 'numeric' })} {/* Solo il numero del giorno */}
                    </p>
                    {tasksForDay.length > 0 ? (
                      <div className="w-full mt-auto">
                        <span className={`inline-block w-2 h-2 rounded-full ${isToday ? 'bg-pink-600' : 'bg-pink-500'} mb-1`}></span>
                        <p className="text-xs text-pink-500">{tasksForDay.length} attività</p>
                      </div>
                    ) : (
                      <div className="w-full mt-auto">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-300 mb-1"></span>
                        <p className="text-xs text-gray-400 italic">Nessuna</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer rimosso, gestito globalmente o non necessario qui se c'è una nav bar */}
      {/* <footer className="w-full bg-pink-200 text-pink-700 py-4 mt-auto shadow-inner">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Il Mio Organizer Personale. Tutti i diritti riservati.</p>
          <p className="text-xs mt-1">Fatto con ♡ per te!</p>
        </div>
      </footer> */}
    </div>
  );
}

export default App;
