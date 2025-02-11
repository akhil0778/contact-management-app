const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { body, validationResult } = require("express-validator");

const db = require("./database");

const router = express.Router();

// GET all contacts
router.get("/contacts", (req, res) => {
  db.all("SELECT * FROM contacts", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET a single contact by ID
router.get("/contacts/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM contacts WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Contact not found" });
    res.json(row);
  });
});

// POST - Create a new contact
router.post(
    "/contacts",
    [
      body("name").notEmpty().withMessage("Name is required"),
      body("email").isEmail().withMessage("Invalid email address"),
      body("phone")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid phone number. Must be 10 digits & start with 6-9"),
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { name, email, phone, address } = req.body;
      const id = uuidv4();
  
      db.run(
        "INSERT INTO contacts (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)",
        [id, name, email, phone, address || ""],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ id, name, email, phone, address });
        }
      );
    }
  );
  

// PUT - Update a contact
router.put(
    "/contacts/:id",
    [
      body("name").notEmpty().withMessage("Name is required"),
      body("email").isEmail().withMessage("Invalid email address"),
      body("phone")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid phone number. Must be 10 digits & start with 6-9"),
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { id } = req.params;
      const { name, email, phone, address } = req.body;
  
      db.run(
        "UPDATE contacts SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
        [name, email, phone, address || "", id],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          if (this.changes === 0) return res.status(404).json({ error: "Contact not found" });
          res.json({ message: "Contact updated successfully" });
        }
      );
    }
  );
  
// DELETE - Remove a contact
router.delete("/contacts/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM contacts WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Contact not found" });
    res.json({ message: "Contact deleted successfully" });
  });
});

module.exports = router;
