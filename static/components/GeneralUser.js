import Books from "./Books.js";
import { globalState } from "./globalState.js";
import { requestBook } from "./RequestBook.js";
import Sections from "./Sections.js";
import UserBooks from "./UserBooks.js";

export default {
  template: `<div>
  <div v-if="filteredBooks.length" class="search-results">
        <h3>Search Results</h3>
        <div class="row row-cols-1 row-cols-md-5 g-4">
          <div class="col" v-for="book in filteredBooks" :key="book.id">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">{{ book.name }}</h5>
                <h6 class="card-title">{{ book.author }}</h6>
                <p class="card-text">{{ book.content }}</p>
                <!-- Add more details or actions if needed -->
                <button v-if="isBookInGlobalState(book.id)" class="btn btn-primary" @click="" :disabled="true">
                  Book Already in
                </button>

                <button v-else class="btn btn-outline-primary" @click="requestBook(book.id)" :disabled="isBookRequested(book.id)">
                  {{ isBookRequested(book.id) ? 'Requested' : 'Request Book' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <br>
        <br>
      </div>
    <UserBooks />
    <Books />
    <Sections />
  </div>`,
  components: {
    Books,
    UserBooks,
    Sections
  },
  data() {
    return {
      sharedRequests: [],
      filteredBooks: [],
      user_id:localStorage.getItem('user_id')
    };
  },
  methods: {
    updateRequests(newRequests) {
      this.sharedRequests = newRequests;
      console.log(newRequests)
    },
    filterBooks(searchTerm) {
      this.filteredBooks = globalState.all_books.filter(book =>
        book.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('filteredbooks:', this.filteredBooks)
    },
    isBookRequested(bookId) {
      return globalState.requests.includes(bookId);
    },
    isBookInGlobalState(bookId) {
      // complete this
      return globalState.user_books.some(book => book.id === bookId);
    },
    async requestBook(book_id) {
      const result = await requestBook(book_id, this.user_id);
      if (result.success) {
        const book = globalState.all_books.find(book => book.id === book_id);
        if (!globalState.requests.includes(book_id)) {
        globalState.requests.push(book_id);
        console.log(globalState.requests)
        }
        console.log('Success:', result.data);

      } else {
        // Handle error
        console.log('Error:', result.message);
      }
    },

  },
  computed: {
    searchTerm() {
      return globalState.search;
    }
  },
  watch: {
    searchTerm(newSearch) {
      console.log('New search term:', newSearch);
      this.filterBooks(newSearch);
    }
  },
}
