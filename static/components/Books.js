import createBook from "./createBook.js";
import EditBooks from "./EditBooks.js";
import UserModal from "./UserModal.js";
import { requestBook } from "./RequestBook.js";
import { globalState } from "./globalState.js";


export default {

    template:`
    <div>
    <br>
    <h2>All Books <button @click="create_book" v-if="role=='Librarian'" class="btn btn-outline-success">Create Book</button></h2>
    <br>
<div class="row row-cols-1 row-cols-md-5 g-4">
  <div v-if="nomorerequests">{{ nomorerequests }}</div>
  <div class="col" v-for="book in books">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">{{ book.name }}</h5>
        <h6 class="card-title">{{ book.author }}</h6>
        <h6 class="card-title">Rating : {{ find_book_rating(book.id) }}</h6>
        <p class="card-text">{{ truncateContent(book.content) }}</p>
        <div v-if="role=='User'">
        <button v-if="isBookInGlobalState(book.id)" class="btn btn-primary" @click="" :disabled="true">
          Book Already in
        </button>

        <button v-else class="btn btn-outline-primary" @click="requestBook(book.id)" :disabled="isBookRequested(book.id)">
          {{ isBookRequested(book.id) ? 'Requested' : 'Request Book' }}
        </button>
        </div>
        <div v-if="role==='Librarian'">
        <div class="btn-group" role="group" aria-label="Basic mixed styles example">
        <button class="btn btn-info" type="button" @click="openModal(book)">Details</button>
        <button class="btn btn-warning" type="button" v-if="role=='Librarian'" @click="edit_book(book)">Edit</button>
        <button class="btn btn-danger" type="button" v-if="role=='Librarian'" @click="deleteBook(book.id)">Delete</button>
        </div>
        </div>
      </div>
    </div>
  </div>
</div>


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
              <div class="modal-body">
                <p><strong>Issued To:</strong></p>
                <p v-if="issue_error">{{ issue_error }}</p>
                <table class="table table-dark table-hover">
                  <thead>
                  <tr>
                    <td>User</td>
                    <td>Access Till</td>
                    <td>Action</td>
                  </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in users">
                      <td>{{ user.email }}</button></td>
                      <td>{{ user.return_date }}</td>
                      <td><button @click="revoke(user.id, selectedBook.id)">Revoke</button></td>
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

  <EditBooks
        :book="selectedBook"
        ref="EditBooks"
        @update-book="handleUpdateBook"
      />
  <createBook 
  @create-book="submit_book"
  ref="createBooks"
  />
</div>`,
    data() {
        return {
        books: [],
        error: null,
        user_id: localStorage.getItem('user_id'),
        role: localStorage.getItem('user_role'),
        selectedBook: {}, 
        users: [],
        issue_error: null,
        edit: false,
        requests:[],
        update_error:null,
        newBook_book_error:null,
        token: localStorage.getItem('auth-token'),
        filteredBooks:[],
        nomorerequests:null
        }
    },
    components:{ UserModal, EditBooks, createBook },
    
  
    async mounted() {
        try {
            const bookRes = await fetch("http://127.0.0.1:5000/all_books", {
              headers: {
                "Authentication-Token":this.token
              }
            });
            if (bookRes.ok) {
                const data = await bookRes.json();
                this.books = data.books;
                globalState.all_books=data.books;
                console.log(globalState.all_books)
            } else {
                const errorData = await bookRes.json();
                this.error = errorData.message;
            }
        } catch (e) {
            this.error = 'Failed to load books';
        }
        if(this.role=="User"){
        try {
            const requestRes = await fetch(`/requests/by_user/${this.user_id}`, {
              headers: {
                "Authentication-Token": this.token
              }
            });
            if (requestRes.ok) {
                const data = await requestRes.json();
                this.requests = data.data;
                globalState.requests = data.data;
                console.log(globalState.requests)
            } else {
                this.requests = [];
            }
        } catch (e) {
            this.requests = [];
        }}
    },
    methods: {
        truncateContent(content) {
            const maxLength = 50;
            return content && content.length > maxLength ? content.slice(0, maxLength) + '...' : content;
        },

        async requestBook(book_id) {
          if(globalState.user_books.length<5){
          const result = await requestBook(book_id, this.user_id);
          if (result.success) {
            const book = this.books.find(book => book.id === book_id);
            if (!this.requests.includes(book_id)) {
            this.requests.push(book_id);
            globalState.requests.push(book_id)
            console.log(globalState.requests)
            }
            console.log('Success:', result.data);

          } else {
            // Handle error
            console.log('Error:', result.message);
          }
        } else{
          this.nomorerequests="you cannot request more books, Sorry!"
        }
        },
        async openModal(book) {
          this.selectedBook=book
          const modal = new bootstrap.Modal(document.getElementById('bookModal'));
          if(this.role=="Librarian"){
          this.users=[]
          this.issue_error=null
          const res= await fetch(`http://127.0.0.1:5000/books/issued/${book.id}`,{
            headers:{
              "Authentication-Token": this.token
            }
          })
          const data = await res.json().catch((e) => {})
          if(res.ok){
            this.users=data.users
            console.log(this.users)
          } else{
            this.issue_error=data.message
          }
          }
          modal.show(); // Show the modal
        },
        async revoke(user_id, book_id) {
          const res= await fetch(`http://127.0.0.1:5000/revoke/${user_id}/${book_id}`, {
            headers:{
              "Authentication-Token":this.token
            }
          })
          const data = await res.json().catch((e) => {})
          if(res.ok){
            console.log('deleted')
            this.users = this.users.filter(user => user.id !== user_id);
            if(!this.users){
              this.issue_error="No Issues"
            }
          }else{
            console.log('not deleted')
          }
        },
        async edit_book(book) {
          this.selectedBook = book;
          this.$refs.EditBooks.show();
        },
        async handleUpdateBook(updatedBook) {
          // Update the local book list with the updated book data
          const res = await fetch(`http://127.0.0.1:5000/update_book/${updatedBook.id}`, {
            method: 'POST', // or 'PATCH' depending on your API
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token
            },
            body: JSON.stringify(updatedBook)
          });
          const data=await res.json().catch((e)=>{})
          if(res.ok){
            const index = this.books.findIndex(book => book.id === updatedBook.id);
            if (index !== -1) {
              this.books.splice(index, 1, updatedBook);
            }else{
              this.update_error="Unable to Update"
            }
          }
        },
        async create_book() {
          this.$refs.createBooks.show();
        },
        async submit_book(book_data) {
          console.log(book_data.name)
          const res=await fetch("/create_book", {
            method: "POST",
            headers:{"Content-Type": 'application/json', "Authentication-Token":this.token},
            body: JSON.stringify(book_data)
          })
          const data=await res.json().catch((e)=>{})
          if(res.ok){
            const newBook = {
              id: data.id,
              author: data.author,
              ...book_data
            };
            console.log(newBook)
            this.books.push(newBook);
            console.log(this.books)
          }else{
            this.newBook_book_error=data.message
            console.log("couldnt add")
          }
        },
        async deleteBook(book_id) {
          const res=await fetch("/delete", {
            headers:{"Content-Type": 'application/json', "Authentication-Token":this.token},
            method: "POST",
            body: JSON.stringify({"book_id":book_id})
          })
          const data=await res.json().catch((e)=>{})
          if(res.ok){
            this.books = this.books.filter(book => book.id !== book_id);
          }
        },
        isBookRequested(bookId) {
          return globalState.requests.includes(bookId);
        },
        isBookInGlobalState(bookId) {
          // complete this
          return globalState.user_books.some(book => book.id === bookId);
        },
        find_book_rating(bookId) {
          // Find the book in globalState.all_books
          const book = globalState.all_books.find(book => book.id === bookId);
          // Return the rating if the book is found, otherwise return 'No rating'
          return book ? book.rating : 'No rating';
        },
        
    }
}