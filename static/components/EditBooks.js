export default {
    template: `
      <div>
        <!-- Modal Trigger Button (for demonstration purposes) -->
  
        <!-- Modal Structure -->
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel">Edit Book Details</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form>
                  <div class="mb-3">
                    <label for="recipient-name" class="col-form-label">Book Name:</label>
                    <input type="text" class="form-control" id="recipient-name" v-model="book_name">
                  </div>
                  <div class="mb-3">
                    <label for="message-text" class="col-form-label">Book Content:</label>
                    <textarea class="form-control" id="message-text" v-model="book_content"></textarea>
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
        book_name: this.book.name,
        book_content: this.book.content
      };
    },
    components: {},
    methods: {
      show() {
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
        modal.show();
      },
      submit() {
        // Emit an event to notify the parent component of the update
        this.$emit('update-book', {
          ...this.book,
          name: this.book_name,
          content: this.book_content
        });
  
        // Close the modal manually
        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal.hide();
      }
    },
    watch: {
      book: {
        handler(newVal) {
          this.book_name = newVal.name;
          this.book_content = newVal.content;
        },
        deep: true,
        immediate: true
      }
    },
    props: ['book']
  };
  