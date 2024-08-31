import { requestBook } from "./RequestBook.js";
import { globalState } from "./globalState.js";

export default {
    props: ['section', 'user_id'],
    template: `
      <div class="modal fade" id="sectionBooksModal" tabindex="-1" aria-labelledby="bookModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="bookModalLabel">{{ section.name }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p><strong>Status: {{ section.id }}</strong> Yeah</p>
            </div>
            <div class="modal-body">
              Section Books :
              <table class="table table-dark table-hover">
                <thead>
                  <tr>
                    <td>Book</td>
                    <td>Action</td>
                  </tr>
                </thead>
                <tbody v-if="user_books_error">
                  <tr><td>No books Issued</td>
                  <td></td>
                  <td></td></tr>
                </tbody>
                <tbody v-else>
                  <tr v-for="book in section.books" :key="book.id">
                    <td>{{ book.name }}</td>
                    <td v-if="user_role=='User'">
                        <button v-if="book.issued_users.includes(user_id)" class="btn btn-primary" :disabled="true">
                            Book Already in
                        </button>
                        <button v-else class="btn btn-primary" @click="requestBook(book.id)" :disabled="isBookRequested(book.id)">
                            Request
                        </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
        return {
            user_role:localStorage.getItem('user_role'),
            user_books_error:null,
    }},
    methods: {
      show() {
        console.log(globalState.requests)
        const modalElement = document.getElementById('sectionBooksModal');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }
      },
      async requestBook(bookId) {
        const result = await requestBook(bookId, this.user_id);
        if (result.success) {
            console.log('Success:', result.data);
            globalState.requests.push(bookId)
        } else {
          // Handle error
          console.log('Error:', result.message);
        }
      },
      isBookRequested(bookId) {
        return globalState.requests.includes(bookId);
      }    
    }
  }
  