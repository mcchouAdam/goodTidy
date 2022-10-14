const authorizationList = {
  forbidden: 0,
  read: 1,
  comment: 2,
  update: 4,
  delete: 8,
  admin: 16,
};

module.exports = {
  authorizationList,
};
