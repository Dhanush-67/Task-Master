class Book {
  constructor(title, author, pages) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.id = crypto.randomUUID();
  }
}

const library = [];

const modal = document.getElementById("modal");
const btn = document.getElementById("newBookButton");
const closeBtn = document.querySelector(".close");
const form = document.getElementById("bookForm");
const bookList = document.getElementById("bookshelf");
const emptyState = document.getElementById("emptyState");
const taskCount = document.getElementById("taskCount");

btn.addEventListener("click", function () {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
});

closeBtn.addEventListener("click", function () {
  closeModal();
});

window.addEventListener("click", function (event) {
  if (event.target == modal) {
    closeModal();
  }
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const pages = document.getElementById("pages").value;

  const newBook = new Book(title, author, pages);
  library.push(newBook);

  form.reset();
  closeModal();
  displayBooks();
});

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function displayBooks() {
  bookList.innerHTML = "";
  taskCount.textContent = library.length;
  emptyState.classList.toggle("hidden", library.length > 0);

  for (const book of library) {
    const bookDiv = document.createElement("div");
    bookDiv.className =
      "book group rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-lg shadow-slate-950/30 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.08]";
    bookDiv.setAttribute("data-id", book.id);
    bookDiv.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Task</p>
          <h3 class="mt-3 text-lg font-semibold text-white">${book.title}</h3>
        </div>
        <span class="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-emerald-300">Open</span>
      </div>
      <div class="mt-6 space-y-3 text-sm text-slate-300">
        <p class="flex items-center justify-between rounded-2xl bg-slate-900/50 px-4 py-3">
          <span class="text-slate-400">Date</span>
          <span class="font-medium text-slate-100">${book.author}</span>
        </p>
        <p class="flex items-center justify-between rounded-2xl bg-slate-900/50 px-4 py-3">
          <span class="text-slate-400">Time</span>
          <span class="font-medium text-slate-100">${book.pages}</span>
        </p>
      </div>
      <button class="deleteButton mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-emerald-300/30 hover:bg-emerald-400/10 hover:text-emerald-200">Done</button>
    `;

    bookList.appendChild(bookDiv);
  }

  const deleteButtons = document.getElementsByClassName("deleteButton");
  for (let i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener("click", function () {
      const bookDiv = this.parentElement;
      const bookId = bookDiv.getAttribute("data-id");
      const bookIndex = library.findIndex((book) => book.id === bookId);
      if (bookIndex !== -1) {
        library.splice(bookIndex, 1);
        displayBooks();
      }
    });
  }
}

displayBooks();
