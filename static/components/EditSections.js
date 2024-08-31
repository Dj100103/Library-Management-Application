export default {
    template: `
      <div>
        <!-- Modal Trigger Button (for demonstration purposes) -->
  
        <!-- Modal Structure -->
        <div class="modal fade" id="EditSectionModal" tabindex="-1" aria-labelledby="EditSectionModal" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="EditSectionModal">Edit Section Details</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form>
                  <div class="mb-3">
                    <label for="recipient-name" class="col-form-label">Section Name:</label>
                    <input type="text" class="form-control" id="recipient-name" v-model="section_name">
                  </div>
                  <div class="mb-3">
                    <label>Books:</label>
                    <div class="form-check" v-for="book in books" :key="book.id">
                    <input class="form-check-input" type="checkbox" :value="book.id" v-model="selectedBooks">
                    <label class="form-check-label" :for="'flexCheckDefault' + book.id">
                        {{ book.name }} | {{ book.author || "No Author" }}
                    </label>
                </div>
            </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" @click="submit">Submit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        section_name: this.section.name,
        selectedBooks:[],
        section_books:[]

      };
    },

    components: {},
    methods: {
      show() {
        const modal = new bootstrap.Modal(document.getElementById('EditSectionModal'));
        modal.show();
      },
      submit() {
        // Emit an event to notify the parent component of the update
        this.$emit('update-section', {
          ...this.section,
          name: this.section_name,
          books: this.selectedBooks
        });
        this.section_name = ''
        this.selectedBooks = []
        this.section_books = []
        const modal = bootstrap.Modal.getInstance(document.getElementById('EditSectionModal'));
        modal.hide();
      }
    },
    watch: {
      section: {
        handler(newVal) {
          this.section_name = newVal.name;
          this.section_books = newVal.books;
        },
        deep: true,
        immediate: true
      }
    },
    props: [ 'section', 'books' ]
  };
  