# Exercises

You are going to re-implement this forum happ, one step at a time. At every step, there will be some missing feature in the DNA code that you'll have to implement, and then run the tests to confirm that your solution is correct.

These are the instructions for step nº1:

1. Run `STEP=1 npm test`.
  - This is the error message you should see:
```
{
  type: 'error',
  data: {
    type: 'ribosome_error',
    data: `Wasm error while working with Ribosome: Host("An error with entry defs in zome 'profiles': entry def not found for App(\\"profile\\")")`
  }
}
```
2. Implement the missing function that that step requires.
3. Run the tests again, until **all tests** pass again.
4. Move on to the next step, and run the new tests.
  - Eg. with step nº2, you should run `STEP=2 npm test`.

## Steps

### Exercise 1: Profiles zome

We are going to be creating the zome that manages the profile information for the users. Its functionality is minimal, users should be able to:

- Create the profile.
- Retrieve the profile of a certain agent.
- Retrieve our own profile.

Solve the next steps in the `profiles` zome, in `dna/zomes/profiles/lib.rs`.

1. Add a `Profile` struct, with only a `nickname` field of type `String`.
  - Annotate this struct with `#[hdk_entry]` to declare it as a Holochain entry.
  - Add the `Profile` entry type to the `entry_defs![]` for the zome.

2. Implement a function `create_profile` that receives a `Profile` struct, and returns the `()` unit type.

3. Implement a function `get_agent_profile` that receives the public key for the agent we are looking the profile for, and returns the profile in an `Option<Profile>`.

4. Implement a function `get_my_profile` that doesn't receive any input parameters, and returns an `Option<Profile>` with out own profile if we have created it.


### Exercise 2: Comments zome

We are 