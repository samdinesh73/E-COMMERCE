const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);
  
  if (err.message === "Not Found") {
    return res.status(404).json({ error: err.message });
  }
  
  res.status(500).json({ error: "Internal Server Error" });
};

module.exports = errorHandler;
