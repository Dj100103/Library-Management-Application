// RequestBook.js
export async function requestBook(bookId, userId) {
    try {
      const response = await fetch(`http://127.0.0.1:5000/request_book/${bookId}/${userId}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem('auth-token')
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        
        return { success: true, data }; // Returning a success object
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message }; // Handling errors
      }
    } catch (error) {
      return { success: false, message: error.message }; // Catch any network or other errors
    }
  }
  