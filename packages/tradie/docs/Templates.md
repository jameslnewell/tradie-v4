# Templates

Templates tell `tradie` what/how to build and test scripts.

Templates `MUST` be named like:

    tradie-template-<name>
    
OR

    @<org>/tradie-template-<name>

Templates may contain:

- `package.json` - Required.
- `config/createVendorConfig.js` - Optional.
- `config/createClientConfig.js` - Recommended.
- `config/createServerConfig.js` - Optional.
- `config/createTestConfig.js` - Required.
 