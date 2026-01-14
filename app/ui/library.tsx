import { useState } from "react";
import { Search, Book, MapPin, X } from "lucide-react";

interface User {
  name: string;
  email: string;
}

interface BookType {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available: boolean;
  location: string;
}

interface LibraryReservation {
  type: "library";
  id: string;
  bookTitle: string;
  author: string;
  location: string;
  reservedDate: string;
  pickupBy: string;
  userName: string;
  status: string;
}

interface LibraryCategoryProps {
  user: User;
  onAddReservation: (reservation: LibraryReservation) => void;
}

const mockBooks: BookType[] = [
  { id: "1", title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "978-0262033848", available: true, location: "Floor 2, Section CS" },
  { id: "2", title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", available: true, location: "Floor 2, Section CS" },
  { id: "3", title: "Design Patterns", author: "Gang of Four", isbn: "978-0201633612", available: false, location: "Floor 2, Section CS" },
];

export function LibraryCategory({ user, onAddReservation }: LibraryCategoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookType[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase();
    const results = mockBooks.filter(book => 
      book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)
    );
    setSearchResults(results);
    setHasSearched(true);
  };

  const confirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 7);

    onAddReservation({
      type: "library",
      id: Date.now().toString(),
      bookTitle: selectedBook.title,
      author: selectedBook.author,
      location: selectedBook.location,
      reservedDate: new Date().toLocaleDateString(),
      pickupBy: pickupDate.toLocaleDateString(),
      userName: user.name,
      status: "reserved",
    });
    setSelectedBook(null);
    alert("Book reserved successfully!");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-8">Library - Book Reservation</h2>

      {/* Main Search Card - Matches Screenshot Exactly */}
      <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="flex items-center gap-2 text-gray-900 font-bold mb-2">
            <Search className="w-5 h-5 text-gray-400" />
            <span>Search Books</span>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Search by book name, author, or ISBN"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-[#0070f3] text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results Area */}
        {hasSearched && (
          <div className="mt-10 border-t border-gray-50 pt-8">
            <p className="text-sm font-bold text-gray-400 mb-6">{searchResults.length} books found</p>
            <div className="grid gap-4">
              {searchResults.map((book) => (
                <div key={book.id} className="p-6 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-colors flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="bg-purple-50 p-3 rounded-xl"><Book className="text-[#a855f7]" /></div>
                    <div>
                      <h4 className="font-bold text-gray-900">{book.title}</h4>
                      <p className="text-sm text-gray-500">by {book.author}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                        <MapPin size={14} /> {book.location}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => book.available && setSelectedBook(book)}
                    disabled={!book.available}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                      book.available 
                      ? "bg-blue-50 text-[#0070f3] hover:bg-[#0070f3] hover:text-white" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {book.available ? "Reserve" : "Not Available"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setSelectedBook(null)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Confirm Reservation</h3>
            <div className="bg-gray-50 p-6 rounded-2xl mb-8">
              <p className="font-bold text-lg text-gray-900">{selectedBook.title}</p>
              <p className="text-blue-600 text-sm font-medium mb-2">{selectedBook.author}</p>
              <p className="text-xs text-gray-400">{selectedBook.location}</p>
            </div>
            <button
              onClick={confirmReservation}
              className="w-full py-4 bg-[#0070f3] text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
              Confirm Reservation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}