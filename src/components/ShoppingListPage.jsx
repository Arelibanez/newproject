import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://hnvnkiqeqvrtifzjaafk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhudm5raXFlcXZydGlmemphYWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDgwMDgsImV4cCI6MjA2MzQ4NDAwOH0.vdxw03jO6q5PzchqpoTnmXlnKrNq0Pd5qMukJcN2Peo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function ShoppingListPage() {
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('shoppingListItems');
    // Ensure items have a quantity, defaulting to 1 if not present
    return savedItems ? JSON.parse(savedItems).map(item => ({...item, quantity: item.quantity || 1, purchased: item.purchased || false })) : [];
  });
  const [newItemText, setNewItemText] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const [editingItemId, setEditingItemId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);

  // Load items from Supabase on initial render
  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .order('created_at', { ascending: true }); // Assuming you have a created_at timestamp

      if (error) {
        console.error('Error fetching items:', error);
      } else {
        setItems(data.map(item => ({...item, quantity: item.quantity || 1, purchased: item.purchased || false })));
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    localStorage.setItem('shoppingListItems', JSON.stringify(items));
  }, [items]);

  const addItem = async (e) => {
    e.preventDefault();

    const text = newItemText.trim();
    const quantity = parseInt(newItemQuantity, 10);

    if (text === '' || isNaN(quantity) || quantity < 1) {
      alert("Assicurati di aver inserito un nome per l'articolo e una quantità valida (almeno 1).");
      return;
    }

    const newItem = { text: text, quantity: quantity, purchased: false };
    
    try {
      // Add to Supabase
      const { data, error: supabaseError } = await supabase
        .from('shopping_list_items')
        .insert([newItem])
        .select();

      if (supabaseError) {
        console.error('[DEBUG] Type of supabaseError:', typeof supabaseError);
        console.error('[DEBUG] supabaseError (raw object - try expanding this in console):', supabaseError);
        try {
          console.error('[DEBUG] supabaseError (JSON.stringify):', JSON.stringify(supabaseError));
        } catch (e_stringify) {
          console.error('[DEBUG] supabaseError could not be stringified:', e_stringify.message);
        }

        let errorMessage = "Errore durante l'aggiunta dell'articolo.";
        if (supabaseError.message) {
          errorMessage += ` Dettagli: ${supabaseError.message}`;
        } else {
          errorMessage += " Nessun dettaglio messaggio disponibile.";
        }
        if (supabaseError.details) {
          errorMessage += ` Info: ${supabaseError.details}`;
        }
        if (supabaseError.hint) {
          errorMessage += ` Suggerimento: ${supabaseError.hint}`;
        }
        errorMessage += " Controlla la console per l'oggetto errore completo (cerca i log [DEBUG]) e la scheda Network per la risposta del server.";
        alert(errorMessage);
      } else if (data && data.length > 0) {
        setItems(prevItems => [...prevItems, {...data[0], quantity: data[0].quantity || 1, purchased: data[0].purchased || false}]);
        setNewItemText('');
        setNewItemQuantity(1);
      } else {
        console.error('No data returned after insert. Item sent:', newItem);
        alert("Errore: nessun dato restituito dopo l'aggiunta (l'item inviato era: " + JSON.stringify(newItem) + "). Controlla la console e la scheda Network.");
      }
    } catch (e) {
      console.error('Unexpected error during addItem:', e);
      alert(`Si è verificato un errore imprevisto: ${e.message || 'Nessun dettaglio'}. Controlla la console e la scheda Network.`);
    }
  };

  const togglePurchased = async (itemId) => {
    const itemToToggle = items.find(item => item.id === itemId);
    if (!itemToToggle) return;

    const updatedPurchasedState = !itemToToggle.purchased;

    // Update in Supabase
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ purchased: updatedPurchasedState })
      .eq('id', itemId);

    if (error) {
      console.error('Error toggling item purchase state:', error);
      alert("Errore durante l'aggiornamento dello stato dell'articolo.");
    } else {
      setItems(
        items.map(item =>
          item.id === itemId ? { ...item, purchased: updatedPurchasedState } : item
        )
      );
    }
  };

  const deleteItem = async (itemId) => {
    // Delete from Supabase
    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
      alert("Errore durante l'eliminazione dell'articolo.");
    } else {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const startEdit = (item) => {
    setEditingItemId(item.id);
    setEditText(item.text);
    setEditQuantity(item.quantity);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (editText.trim() === '' || editQuantity < 1) return;

    const updatedItem = { text: editText, quantity: parseInt(editQuantity, 10) };

    // Update in Supabase
    const { error } = await supabase
      .from('shopping_list_items')
      .update(updatedItem)
      .eq('id', editingItemId);

    if (error) {
      console.error('Error editing item:', error);
      alert("Errore durante la modifica dell'articolo.");
    } else {
      setItems(
        items.map(item =>
          item.id === editingItemId ? { ...item, ...updatedItem } : item
        )
      );
      setEditingItemId(null);
      setEditText('');
      setEditQuantity(1);
    }
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditText('');
    setEditQuantity(1);
  };

  const clearPurchasedItems = async () => {
    const purchasedItemIds = items.filter(item => item.purchased).map(item => item.id);
    if (purchasedItemIds.length === 0) return;

    // Delete from Supabase
    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .in('id', purchasedItemIds);
    
    if (error) {
      console.error('Error clearing purchased items:', error);
      alert("Errore durante la rimozione degli articoli acquistati.");
    } else {
      setItems(items.filter(item => !item.purchased));
    }
  };

  return (
    <div className="flex flex-col items-center font-serif bg-pink-50 py-6 sm:py-10 px-4 min-h-screen w-full">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl border border-pink-200">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center text-pink-700">Lista della Spesa</h1>
        
        {/* Form per aggiungere item */} 
        <form onSubmit={addItem} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Articolo..."
              className="border-2 border-pink-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 w-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-pink-700 placeholder-pink-300"
            />
            <div className="flex space-x-2">
              <input
                type="number"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.valueAsNumber || 1)}
                min="1"
                placeholder="Qtà"
                className="border-2 border-pink-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 w-20 sm:w-24 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-pink-700 placeholder-pink-300"
              />
              <button
                type="submit"
                className="bg-pink-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 whitespace-nowrap flex-grow sm:flex-grow-0"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </form>

        {/* Lista degli item */} 
        <ul className="space-y-2 mb-6">
          {items.length === 0 && (
            <p className="text-center text-pink-400 italic py-4">La tua lista della spesa è vuota!</p>
          )}
          {items.map(item => (
            <li
              key={item.id}
              className={`p-2 sm:p-3 rounded-lg transition-all duration-300 ease-in-out ${item.purchased ? 'bg-pink-100 text-pink-500 opacity-80' : 'bg-white hover:bg-pink-100 border border-pink-200'
              }`}
            >
              {editingItemId === item.id ? (
                <form onSubmit={handleEdit} className="flex flex-col space-y-2">
                  <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="border-2 border-pink-300 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-pink-500 text-pink-700 placeholder-pink-300"
                    />
                    <input
                      type="number"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.valueAsNumber || 1)}
                      min="1"
                      className="border-2 border-pink-300 rounded-lg px-3 py-1.5 w-full sm:w-20 focus:outline-none focus:ring-1 focus:ring-pink-500 text-pink-700 placeholder-pink-300"
                    />
                  </div>
                  <div className="flex space-x-2 justify-end">
                    <button type="submit" className="bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600 text-xs">Salva</button>
                    <button type="button" onClick={cancelEdit} className="bg-pink-200 text-pink-700 px-3 py-1 rounded-md hover:bg-pink-300 text-xs">Annulla</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div onClick={() => togglePurchased(item.id)} className={`cursor-pointer flex-grow mb-2 sm:mb-0 ${item.purchased ? 'line-through italic' : 'text-pink-700'}`}>
                    {item.text} <span className={`text-xs ${item.purchased ? 'text-pink-400' : 'text-pink-500'}`}> (x{item.quantity})</span>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2 ml-0 sm:ml-2 self-start sm:self-center">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-pink-500 hover:text-pink-700 p-1 rounded-full hover:bg-pink-100 transition-colors duration-200"
                      aria-label="Modifica articolo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                      aria-label="Elimina articolo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {items.some(item => item.purchased) && (
          <div className="mt-6 text-center">
            <button
              onClick={clearPurchasedItems}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 text-sm w-full sm:w-auto"
            >
              Rimuovi Acquistati
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingListPage;
