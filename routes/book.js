const router = require("express").Router();
const bookService = require("../services/bookService");
const SchemaValidator = require("../middlewares/SchemaValidator");
const { isAuthenticatedUser } = require("../middlewares/auth");
const bookValidatorSchema = require("../validators/bookValidatorSchema");
const validator = new SchemaValidator();

router.get(
  "/",
  isAuthenticatedUser(),
  validator.query(bookValidatorSchema.bookListingRequestModel),
  bookService.getBookListng
);

router.get("/:id", isAuthenticatedUser(), bookService.getBook);

router.post(
  "/",
  isAuthenticatedUser(),
  validator.body(bookValidatorSchema.createBookRequestModel),
  bookService.createBook
);

module.exports = router;
