module.exports = {
  "extends": "airbnb",
  "plugins": [
   "react",
   "jsx-a11y",
   "import"
  ],    
  rules: {
    "quotes": [1, "double"], // specify whether double or single quotes should be used
    "no-underscore-dangle": 0, // allow '_myvar'
    "no-use-before-define": 0
  }
};