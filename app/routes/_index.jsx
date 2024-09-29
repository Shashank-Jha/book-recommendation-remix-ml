import { Form, useLoaderData } from "@remix-run/react";

export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const query = url.searchParams.get("query");

        console.log("Query:", query);  // Debugging: Log the query

        if (!query) return { books: [] };

        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        console.log("APIKEY:", apiKey);  // Debugging: Log the API key

        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            console.error("Error fetching books:", response.status, response.statusText);
            return { books: [] };  // Return empty books array on error
        }

        const data = await response.json();

        const books = data.items?.map(item => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors || ["Unknown Author"],
            description: item.volumeInfo.description || "No description available",
            thumbnail: item.volumeInfo.imageLinks?.thumbnail || "",
        })) || [];

        return { books };
    } catch (error) {
        console.error("An error occurred in the loader:", error);
        return { books: [] };
    }
}

export default function Search() {
    const { books } = useLoaderData();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <h1 className="text-4xl font-bold text-gray-800 mt-8">Search for Books</h1>

            <Form method="get" className="mt-6 w-full max-w-lg flex">
                <input
                    type="text"
                    name="query"
                    placeholder="Enter book title or author"
                    className="flex-1 p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="p-3 bg-blue-500 text-white font-semibold rounded-r-md hover:bg-blue-600"
                >
                    Search
                </button>
            </Form>

            <div className="book-list mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-4">
                {books.length > 0 ? (
                    books.map((book) => (
                        <div
                            key={book.id}
                            className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col items-center p-4"
                        >
                            {book.thumbnail ? (
                                <img
                                    src={book.thumbnail}
                                    alt={book.title}
                                    className="w-32 h-48 object-cover mb-4"
                                />
                            ) : (
                                <div className="w-32 h-48 bg-gray-200 mb-4"></div>
                            )}
                            <h3 className="text-lg font-semibold text-gray-800">{book.title}</h3>
                            <p className="text-sm text-gray-600">{book.authors.join(", ")}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {book.description.substring(0, 100)}...
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-lg">No books found. Try searching for something else.</p>
                )}
            </div>
        </div>
    );
}
