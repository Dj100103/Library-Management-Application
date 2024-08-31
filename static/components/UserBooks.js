import { globalState } from "./globalState.js";

export default {
    template: `
      <div>
        <h2>My Books</h2>
        <div v-if="error" class="card">
          <div class="card-body">
            You have no Books. Request One
          </div>
        </div>
        <div class="row row-cols-1 row-cols-md-5 g-4">
          <div class="col" v-for="book in my_books" :key="book.id">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">{{ book.name }}</h5>
                <h6 class="card-title">{{ book.author }}</h6>
                <h6 class="card-title">Access Till : {{ book.return_date }}</h6>
                <button class="btn btn-outline-success" @click="openModal(book)">Read Book</button>
                <button class="btn btn-outline-danger" @click="return_book(book)">Return</button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Modal -->
        <div class="modal fade" id="bookModal" tabindex="-1" aria-labelledby="bookModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="bookModalLabel">{{ selectedBook.name }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p><strong>Author:</strong> {{ selectedBook.author }}</p>
                <p><strong>Content:</strong></p>
                <p>{{ selectedBook.content }}</p>
              </div>
              <div class="modal-footer">
              <h6>Rating : {{ selectedBook.rating }}</h6>
              <p><button type="btn btn-success" @click="rate_book(1)">&#9733</button>
              <button type="btn btn-success" @click="rate_book(2)">&#9733</button>
              <button type="btn btn-success" @click="rate_book(3)">&#9733</button>
              <button type="btn btn-success" @click="rate_book(4)">&#9733</button>
              <button type="btn btn-success" @click="rate_book(5)">&#9733</button></p>
              </div>
              <div class="modal-footer">
                <h6>Return by : {{ selectedBook.return_date }}</h6>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        my_books: [],
        user_id: localStorage.getItem('user_id'),
        error: null,
        selectedBook: {}, // To hold the currently selected book
        book_remove_error: null,
        token: localStorage.getItem("auth-token")

      };
    },
    async mounted() {
        const res = await fetch(`http://127.0.0.1:5000/user_books/${this.user_id}`, {
          headers: {
            "Authentication-Token": this.token
          }
        });
        console.log(globalState.user_books)
        const data = await res.json().catch((e) => {})
  
        if (res.ok) {
          this.my_books = data.issued_books;
          globalState.user_books=data.issued_books
          console.log("user_books: ", globalState.user_books)
        } else {
          this.error = data.message;
        }
    },
    methods: {
      openModal(book) {
        this.selectedBook = book; // Set the selected book
        const modal = new bootstrap.Modal(document.getElementById('bookModal')); // Create a new Bootstrap modal instance
        modal.show(); // Show the modal
      },
      async return_book(book) {
        const res=await fetch(`/revoke/${this.user_id}/${book.id}`, {
          headers: {
            "Authentication-Token": this.token
          }
        })
        const data = await res.json().catch((e) => {})
        if(res.ok){
          this.my_books = this.my_books.filter(b => b.id !== book.id);
          globalState.user_books = globalState.user_books.filter(b => b.id !== book.id)
          if(this.my_books.length==0){
            this.error="You have no books to read."
          }
        }else{
          this.book_remove_error=data.message
        }
      },
      async rate_book(stars) {
        const res=await fetch("/rate_book", {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token
          },
          method:"POST",
          body: JSON.stringify({"stars":stars, "book_id":this.selectedBook.id, "user_id":this.user_id})
        })
        const data=await res.json().catch((e)=>{})
        if(res.ok){
          console.log("rated")
          this.selectedBook.rating=data.updated_book_rating
          const indexAllBooks = globalState.all_books.findIndex(book => book.id === this.selectedBook.id);
          if (indexAllBooks !== -1) {
            this.$set(globalState.all_books, indexAllBooks, { ...globalState.all_books[indexAllBooks], rating: this.selectedBook.rating });
          }

          // Update the book in globalState.user_books reactively
          const indexUserBooks = globalState.user_books.findIndex(book => book.id === this.selectedBook.id);
          if (indexUserBooks !== -1) {
            this.$set(globalState.user_books, indexUserBooks, { ...globalState.user_books[indexUserBooks], rating: this.selectedBook.rating });
          }
        }
      }
  }
}