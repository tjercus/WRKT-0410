module.exports = {
  "extends": "airbnb",
  "plugins": [
   "react",
   "jsx-a11y",
   "import"
  ],
  rules: {
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    "quotes": [1, "double"], // specify whether double or single quotes should be used
    "no-underscore-dangle": 0, // allow '_myvar'
    "no-use-before-define": 0,
    "valid-jsdoc": 1,
    "require-jsdoc": [1, {
        "require": {
            "FunctionDeclaration": true,
            "MethodDefinition": true,
            "ClassDeclaration": true
        }
    }]
  }
};
