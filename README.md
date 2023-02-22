# forum

This is a basic Holochain training, with step by step exercises and their tests.

It consists of a forum hApp that has already been implemented, both its backend and a small UI. You can boot up the UI at first to see what are their functionalities.

## Your goals

Your goal is to re-implement this forum happ, one step at a time.

To do that, go into `EXERCISES.md` and follow its instructions. Have fun!

## Environment Setup

1. Install the holochain dev environment: https://developer.holochain.org/docs/install/
2. Enable Holochain cachix with:

```bash
nix-env -iA cachix -f https://cachix.org/api/v1/install
cachix use holochain-ci
```

3. Clone this repo and `cd` inside of it.
4. Enter the nix shell by running this in the root folder of the repository: 

```bash
nix develop
npm install
```

This will install all the needed dependencies in your local environment, including `holochain`, `hc` and `npm`.

Run all the other instructions in this README from inside this nix-shell, otherwise **they won't work**.

## Starting an agent

Start a forum agent with:

```bash
npm start
```

You should be able to see all the posts that other participants have created in this DHT.

## Bootstrapping a network

Create a whole network of nodes connected to each other and their respective UIs with.

```bash
AGENTS=3 npm run network 
```

Substitute the "3" for the number of nodes that you want to bootstrap in your network.

This will also bring up the Holochain Playground for advanced introspection of the conductors.


## Documentation

This repository is using this tooling:

- [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces/): npm v7's built-in monorepo capabilities.
- [hc](https://github.com/holochain/holochain/tree/develop/crates/hc): Holochain CLI to easily manage Holochain development instances.
- [@holochain/tryorama](https://www.npmjs.com/package/@holochain/tryorama): test framework.
- [@holochain/client](https://www.npmjs.com/package/@holochain/client): client library to connect to Holochain from the UI.
- [@holochain-playground/cli](https://www.npmjs.com/package/@holochain-playground/cli): introspection tooling to understand what's going on in the Holochain nodes.
