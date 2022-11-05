const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { boolean } = require("joi");

const bookSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter book name"],
  },
  author: {
    type: String,
    required: [true, "Please enter author name"],
  },
  publicationYear: {
    type: Date,
    required: [true, "Please enter publication year"],
  },
  price: {
    type: Number,
    required: [true, "Please enter price"],
  },
  exhibitorBoothNumber: {
    type: Number,
    required: [true, "Please enter exhibitor booth number"],
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

bookSchema.pre("count", function () {
  this.where({ deletedAt: null });
});

bookSchema.pre("find", function () {
  this.where({ deletedAt: null });
});

bookSchema.pre("findOne", function () {
  this.where({ deletedAt: null });
});

bookSchema.methods.delete = async function () {
  if (!this.deletedAt) {
    this.deletedAt = Date.now();
    await this.save();
  }
};

bookSchema.statics.searchQuery = function (keyword) {
  const stringSearchFields = ["name", "author"];
  const alphaNumericSearchFields = ["_id"];

  let query = {};
  if (keyword) {
    query = {
      $or: [
        ...stringSearchFields.map((field) => ({
          [field]: {
            $regex: keyword,
            $options: "i",
          },
        })),
        ...alphaNumericSearchFields.map((field) => ({
          $where: `/.*${keyword}.*/.test(this.${field})`,
        })),
      ],
    };
  }

  return this.find(query);
};

module.exports = mongoose.model("Book", bookSchema);
