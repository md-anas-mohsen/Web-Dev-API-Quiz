exports.applyPagination = (dbQuery, queryString) => {
  let { page, limit } = queryString;

  if (!page) {
    page = 1;
  }

  if (!limit) {
    limit = 20;
  }

  return dbQuery.skip((page - 1) * limit).limit(limit);
};
