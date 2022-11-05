const MESSAGES = require("../constants/messages");
const Book = require("../models/book");
const { applyPagination } = require("../utils/generalHelpers");

const bookService = {
  createBook: async (req, res) => {
    const { name, author, publicationYear, price, exhibitorBoothNumber } =
      req.body;

    try {
      const existingBook = await Book.findOne({
        author: {
          $regex: `^${author}$`,
          $options: "i",
        },
        name: {
          $regex: `^${name}$`,
          $options: "i",
        },
      });

      if (!!existingBook) {
        return res.status(400).json({
          success: false,
          message: "Book with this author already exists",
        });
      }

      const book = await Book.create({
        name,
        author,
        publicationYear: `${publicationYear}`,
        price,
        exhibitorBoothNumber,
      });

      return res.status(201).json({
        success: true,
        message: "Book created",
        book,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: MESSAGES.SERVER_ERROR,
      });
    }
  },
  getBook: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id not provided",
      });
    }

    let book;
    try {
      book = await Book.findById(id);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: MESSAGES.SERVER_ERROR,
      });
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      book,
    });
  },
  getBookListng: async (req, res) => {
    const { keyword } = req.query;
    const books = await applyPagination(Book.searchQuery(keyword), req.query);
    const count = await Book.searchQuery(keyword).count();

    return res.status(200).json({
      success: true,
      count,
      books,
    });
  },
};

module.exports = bookService;
