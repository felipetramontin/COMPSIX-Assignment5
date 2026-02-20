const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const { body, validationResult } = require('express-validator');

const menuValidationPost = [
  body('name')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Name of the item must be at least 3 characters long.'),

  body('description')
    .isString()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long.'),

  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a number greater than 0.'),

  body('category')
    .isString()
    .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
    .withMessage('Category must be one of: appetizer, entree, dessert, beverage.'),

  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('Ingredients must be an array with at least one ingredient.'),

  body("available")
    .optional()
    .isBoolean()
    .withMessage("Available must be a boolean")
    .toBoolean(),
];


const menuValidationPut = [
  body('name')
    .optional()
    .isString()
    .isLength({ min: 3 })
    .withMessage('Name of the item must be at least 3 characters long.'),

  body('description')
    .optional()
    .isString()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long.'),

  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be a number greater than 0.'),

  body('category')
    .optional()
    .isString()
    .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
    .withMessage('Category must be one of: appetizer, entree, dessert, beverage.'),

  body('ingredients')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Ingredients must be an array with at least one ingredient.'),

  body("available")
    .optional()
    .isBoolean()
    .withMessage("Available must be a boolean")
    .toBoolean(),
];

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, originalUrl, body } = req;

  console.log("----- Incoming Request -----");
  console.log("Timestamp:", timestamp);
  console.log("Method:", method);
  console.log("URL:", originalUrl);

  if (method === "POST" || method === "PUT") {
    console.log("Request Body:", body);
  }

  console.log("----------------------------");

  next();
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      const errorMessages =
  errors.array().map(error => error.msg);
  
      return res.status(400).json({
          error: 'Validation failed',
          messages: errorMessages
      });
  }

  if (req.body.available === undefined) {
    req.body.available = true;
  }

  next();
};

app.use(requestLogger);

app.listen(port, () => {
  console.log(`Restaurant API server running at http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.json({
    message: "Welcome to the Restaurant API",
    endpoints: {
      "GET /menu": "Retrieve all menu items",
      "GET /menu/:id": "Retrieve a specific menu item",
      "POST /menu": "Add a new menu item",
      "PUT /menu/:id": "Update an existing menu item",
      "DELETE /menu/:id": "Remove a menu item"
    }
  });
});

app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

app.get('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const menuItem = menuItems.find(item => item.id === id);

  if (menuItem) {
    res.json(menuItem);
  } else {
    res.status(404).json({ error: "Menu item not found" });
  }
});

app.post('/api/menu', menuValidationPost, handleValidationErrors, (req, res) => {
  const { name, description, price, category, ingredients, available } = req.body;
  const newMenuItem = {
    id: menuItems.length + 1,
    name,
    description,
    price,
    category,
    ingredients,
    available
  };

  menuItems.push(newMenuItem);

  res.status(201).json(newMenuItem);
});

app.put('/api/menu/:id', menuValidationPut, handleValidationErrors, (req, res) => {
  const itemId = parseInt(req.params.id);
  const { name, description, price, category, ingredients, available } = req.body;

  const menuItemIndex = menuItems.findIndex(item => item.id === itemId);

  if (menuItemIndex === -1) {
    return res.status(404).json({ error: "Menu item not found" });
  };

  menuItems[menuItemIndex] =
  {
    id: itemId,
    name,
    description,
    price,
    category,
    ingredients,
    available
  };

  res.json(menuItems[menuItemIndex]);
});

app.delete('/api/menu/:id', (req, res) => {
  const itemId = parseInt(req.params.id);

  const menuItemIndex = menuItems.findIndex(item => item.id === itemId);

  if (menuItemIndex === -1) {
    return res.status(404).json({ error: "Menu item not found" });
  };

  const deletedItem = menuItems.splice(menuItemIndex, 1);

  res.json({ message: "Menu item deleted", item: deletedItem[0] });
});

module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Restaurant API server running at http://localhost:${port}`);
  });
}

module.exports = app;