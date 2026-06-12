module.exports = {
  '**/*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '**/*.{json,md,mdc,yaml}': ['prettier --write'],
};
