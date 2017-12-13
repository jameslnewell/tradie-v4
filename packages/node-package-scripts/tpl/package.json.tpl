{
  "name": "node-package-example",
  "version": "1.0.0",
  "files": ["lib",".flowconfig"],
  "devDependencies": {
    "@tradie/node-package-scripts": "^<%= version %>"
  },
  "scripts": {
    "clean": "tradie clean",
    "lint": "tradie lint",
    "build": "tradie build",
    "watch": "tradie build --watch",
    "test": "tradie test",
    "prepublishOnly":
      "tradie clean && tradie lint && tradie test && tradie build"
  }
}
