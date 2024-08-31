export default {
    props: ['selectedUser', 'user_books', 'user_books_error'],
    template: `
      <div class="modal fade" id="bookModal" tabindex="-1" aria-labelledby="bookModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="bookModalLabel">{{ selectedUser.user_email }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p><strong>Status:</strong> {{ selectedUser.user_status }}</p>
            </div>
            <div class="modal-body">
              Issued Books : 
              <table class="table table-dark table-hover">
                <thead>
                  <tr>
                    <td>Book</td>
                    <td>Access Till</td>
                  </tr>
                </thead>
                <tbody v-if="user_books_error">
                  <tr><td>No books Issued</td>
                  <td></td>
                  <td></td></tr>
                </tbody>
                <tbody>
                  <tr v-for="book in user_books" :key="book.id">
                    <td>{{ book.name }}</td>
                    <td>{{ book.return_date }}</td>
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
    methods: {
      show() {
        const modal = new bootstrap.Modal(document.getElementById('bookModal'));
        modal.show();
      }
    }
  }
  