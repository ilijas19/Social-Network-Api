const notFound = (req, res) => {
  res.status(404).json("Resource Not Found");
};

module.exports = notFound;
