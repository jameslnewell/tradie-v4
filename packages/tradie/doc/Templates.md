# Templates

Templates tell `tradie` what and how to build, serve and test your files.

Templates `MUST` be named like:

    tradie-template-<name>
    
OR

    @<org>/tradie-template-<name>

Templates may contain:

- `package.json` - Required.
- `config/createVendorConfig.js` - Optional.
- `config/createClientConfig.js` - Recommended.
- `config/createBuildConfig.js` - Optional.
- `config/createServerConfig.js` - Optional.
- `config/createTestConfig.js` - Required.
