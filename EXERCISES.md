# Exercises

You are going to re-implement this forum happ, one exercise at a time. Every exercise has a series of steps, and in each step there will be some missing feature in the DNA code that you'll have to implement, and then run the tests to confirm that your solution is correct.

These are the instructions for the first step, amenable to all the other steps:

0. Run `nix develop`. This sets up your terminal with all the developer tooling necessary. Run ALL the commands below WITHIN this environment, otherwise they won't work.

1. Run `EXERCISE=1 STEP=1 npm test`.

- This is the error message you should see:

```
Error: There are no entries defined in the profiles zome
    at file:///home/guillem/projects/holochain/immersive/forum-happ/tests/src/profile.ts:36:15
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async runScenario (file:///home/guillem/projects/holochain/immersive/forum-happ/node_modules/@holochain/tryorama/lib/local/scenario.js:102:9)
    at async file:///home/guillem/projects/holochain/immersive/forum-happ/tests/src/profile.ts:10:5
```

2. Implement the missing function that that step requires (see step 1 in the "Exercise 1: Profiles zome" section of this document).
3. Run the tests again, until **all tests** pass again.
4. Move on to the next step, and run the new tests.

- Eg. for the second step, you should run `EXERCISE=1 STEP=2 npm test`.

5. When you are done with all the steps in an exercise, move to the next exercise (see step 1 in the "Exercise 2: Comments zome" of this document):

- Eg. for first step of the 2nd exercise, you should run `EXERCISE=2 STEP=1 npm test`.

WARNING! If at any point in time, you see a long error message that ends like this one:

```
  = note: rust-lld: error: duplicate symbol: __num_link_types
          >>> defined in /home/guillem/projects/holochain/immersive/forum-happ/target/wasm32-unknown-unknown/release/deps/profiles.profiles.5a73b8e7-cgu.6.rcgu.o
          >>> defined in /home/guillem/projects/holochain/immersive/forum-happ/target/wasm32-unknown-unknown/release/deps/libprofiles_zome-d5e1996845075c54.rlib(profiles_zome-d5e1996845075c54.profiles_zome.2103d8eb-cgu.1.rcgu.o)
          

error: could not compile `profiles` due to previous error
```

With the "duplicate symbol" message, it means that you are running your tests with the wrong step number. Double-check that you are running the appropriate step for the code exercise you are trying to solve.

> Notice that if you complete some steps, running the tests for any previous step will give this error as well. Only run the tests for the last step and exercise you have completed or are attempting.

## Exercise 1: Profiles zome

We are going to create a zome that manages the profile information for the users. A user should be able to:

- Create the profile.
- Retrieve the profile of a certain agent.
- Retrieve our own profile.

Solve the next steps in the `profiles` zome, in `dna/zomes/profiles/lib.rs`.

1. Add a `Profile` struct, with only a `nickname` field of type `String`.

- Annotate this struct with `#[hdk_entry_helper]` to declare it as a Holochain entry.
- Define an `EntryTypes` enum, with only one variant named `Profile` that has the `Profile` struct as its payload.
- Annotate this enum with `#[hdk_entry_defs]` and `#[unit_enum(UnitTypes)]` to declare the entry types for this zome.

2. Create a function `create_profile` that receives a `Profile` struct, creates the `Profile` entry, and returns an `ExternResult<ActionHash>` with the `ActionHash` for the action that was just created.

3. Create a link from the author's public key to the profile after the profile is created:

- Define a `LinkTypes` enum with only one unit variant: `AgentToProfile`.
- Annotate this enum with `#[hdk_link_types]` to declare the link types for this zome.
- Modify the `create_profile` function: after the profile is created, create a link from the public key of the agent calling the function to the profile action hash, with `LinkTypes::AgentToProfile` as the link type.

4. Create a function `get_agent_profile` that receives the public key for the agent we are looking the profile for, and returns the profile in an `ExternResult<Option<Profile>>`.

- In general, to extract an entry in the form of its rust struct from a record that contains it, you can use [.to_app_option()](https://docs.rs/hdk/latest/hdk/prelude/enum.RecordEntry.html#method.to_app_option). For example, to convert a record from a `Comment` app struct: 

```rust
let maybe_entry: Option<Entry> = record
  .entry
  .into_option();

let entry: Entry =  maybe_entry.ok_or(wasm_error!(WasmErrorInner::Guest(String::from("This record doesn't include any entry"))))?;

let comment = Comment::try_from(entry)?;
```

5. Create a function `get_my_profile` that doesn't receive any input parameters, and returns an `ExternResult<Option<Profile>>` with our own profile if we have created it.

## Exercise 2: Comments zome

We are going to create a zome that manages comments attached to posts. A user should be able to:

- Create a comment attached to a particular post.
- Retrieve all the comments attached to a particular post.
- Delete a comment. This should be only available to its author.

Solve the next steps in the `comments` zome, in `dna/zomes/comments/lib.rs`.

1. Add a `Comment` struct, with only a `comment` field of type `String`.

- Annotate this struct with `#[hdk_entry_helper]` to declare it as a Holochain entry.
- Define the entry types enum and add the `Comment` entry type to to it.

2. Create a function `create_comment` that receives a `CreateCommentInput` struct, creates the comment and returns an `ExternResult<ActionHash>` with the `ActionHash` of the created comment.

- Define the `CreateCommentInput` as a struct that has two fields:
  - `comment_on`, of type `ActionHash`. This refers the post that is being commented on.
  - `comment`, of type String, the actual comment.

3. Define the link types enum for the zome with only one variant `CommentedOnToComment`.
   
- In the `create_comment` function, after the comment is created, create a link from the `comment_on` hash to the `comment` hash.

> Note: there are no tests for this step, so if you run `EXERCISE=2 STEP=3 npm test`, it won't result in an error.

4. Create a function `get_comments_on` that receives a `ActionHash` for a post and returns all the comments that have been created for that post, in the form of a `ExternResult<Vec<Record>>`.

5. Create a function `delete_comment` that receives the `ActionHash` of the comment that is to be deleted, and deletes that comment.


## Exercise 3: Posts zome

We are going to create the last zome, that manages posts and channels. A user should be able to:

- Create a post in a particular channel.
- Retrieve all the channels that have been created.
- Retrieve all the posts that have been created for a particular channel.
- If the user is the author of a post, they should be able to update its content.


Solve the next steps in the `posts` zome, in `dna/zomes/posts/lib.rs`.

1. Add a `Post` struct, with two fields: a `title` field of type `String`, and a `content` field of type `String`.

- Annotate this struct with `#[hdk_entry_helper]` to declare it as a Holochain entry.
- Define the entry types enum and add the `Post` entry type to to it.

2. Create a function `create_post` that receives a `CreatePostInput` struct, creates the post and returns an `ExternResult<ActionHash>` with the `ActionHash` of the created post. Define the `CreatePostInput` as a struct that has a field `post` of type `Post`.

3. Add a `channel` field of type `String` in the `CreatePostInput` struct.

> Note: there are no tests for this step, so if you run `EXERCISE=2 STEP=3 npm test`, it won't result in an error.

4. Create the given channel:

- Define the link types enum with only one variant: `PathToChannel`.
- After the post gets created, build a path of the form `all_posts.<CHANNEL_NAME>`. 
  - Eg. if the given channel is `nature`, the path should be `all_posts.nature`.
- Add the `PathToChannel` link type to the path to turn it into a `TypedPath`.
- Call `.ensure()` with the typed path so that a path gets created for the given channel name. 

5. Change the function `create_post` so that after the channel path gets created, it also creates a link from the entry hash of that channel path to the action hash of the created post.

- You'll need to add a new link type variant: `ChannelToPost`.

> Note: there is not any tests for this step, so if you run `EXERCISE=3 STEP=5 npm test` won't result in an error.

6. Create a function `get_channel_posts` that receives a channel `String`, and returns an `ExternResult<Vec<ActionHash>>` for all the posts that have been created in the given channel. The action hashes should be ordered by the time that they were created in descendant order (most recent ones first).

- Use the `path_entry_hash()` method for a `Path` to calculate the `EntryHash` of the channel's path.

7. Create a function `get_all_channels` that doesn't receive any input parameter, and returns a `ExternResult<Vec<String>>` with the names of all the channels that have been created.

- Recreate the root `TypedPath` path for the channel.
- Get the list of paths for the channels using the `children_paths()` method for a `TypedPath`.
- Get the last component of each path with the `leaf()` method for a `TypedPath`.
- Transform the last component to a normal String using `String::try_from()`.

8. Create a function `update_post`, that receives as input an `UpdatePostInput` struct, updates the post and returns an `ExternResult<ActionHash>` with the `ActionHash` of the updated post. Define the `UpdatePostInput` as a struct that has a field `udpated_post` of type `Post`, and an `post_to_update` field of type `ActionHash`.

9. Create a function `get_post`, that receives as input the original `ActionHash` for a post, and returns the latest update for that post in the form of a `ExternResult<Record>`.
