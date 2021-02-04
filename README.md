# rsk-verify-tools

> A set of tools to manage smart contract verifications.

**Get** verification's payloads from multiple rsk-explorer-api instances.
**Verify** rsk-contract-verifier payloads files.
**Publish** verifications to rsk-explorer-api instances.

## Requisites

- node >= 12.18.2

**get and publish** require a connection to a rsk-explroer-api instance.
**verify**, requires access to JSON/RPC interface of a rskj node.

### Rskj nodes

The rskj nodes must have these modules enabled:

- eth
- trace

When a contract was deployed by an internal transaction the verifier uses the rskj trace module to get the contract's bytecode. if the trace module is disabled the verifier uses an explorer to get the bytecode, logging a warning message.

### Explorers

To publish contracts, the explorers should be running **rsk-explorer-api v1.2.1^**

## Install

```shell
npm install @rsksmart/rsk-verify-tools
cd rsk-verify-tools
npm install
npm run setup
```

## Configuration

The default configuration uses rsk-explorer and rskj nodes public instances.

### Show current configuration

```shell
  npm run config
```

### Create a configuration file

``` shell
    cp config-example.json config.json
  ```

### Configuration file

#### Example

see: [config-example.json](config-example.json).

- **explorers:** Array of explorer's urls.
- **nodes:** List of rskj nodes
- **repository:** WIP Git contract's repository.
- **log:** Log configuration.
- **out:** Directory to store the contracts payloads.

## Tasks

### Get

Gets verification payloads from explorers.

```shell
npm run get
```

or

```shell
node src/get.js --help
```

### Verify

Verify contracts.

```shell
npm run verify
```

or

```shell
node src/verify.js --help
```

### Publish

Publish verifications to explorers.

```shell
npm run publish
```

or

```shell
node src/publish.js --help
```
