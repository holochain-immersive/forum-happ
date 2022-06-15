# Exercises

You are going to re-implement this forum happ, one exercise at a time. Every exercise has a series of steps, and in each step there will be some missing feature in the DNA code that you'll have to implement, and then run the tests to confirm that your solution is correct.

These are the instructions for the first step, amenable to all the other steps:

1. Run `EXERCISE=1 STEP=1 npm test`.

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

- Eg. for the second step, you should run `EXERCISE=1 STEP=2 npm test`.

5. When you are done with all the steps in an exercise, move to the next exercise:

- Eg. for first step of the 2nd exercise, you should run `EXERCISE=2 STEP=1 npm test`.

## Exercise 1: Profiles zome

We are going to create a zome that manages the profile information for the users. A user should be able to:

- Create the profile.
- Retrieve the profile of a certain agent.
- Retrieve our own profile.

Solve the next steps in the `profiles` zome, in `dna/zomes/profiles/lib.rs`.

1. Add a `Profile` struct, with only a `nickname` field of type `String`.

- Annotate this struct with `#[hdk_entry]` to declare it as a Holochain entry.
- Add the `Profile` entry type to the `entry_defs![]` for the zome.

2. Create a function `create_profile` that receives a `Profile` struct, and returns the `()` unit type.

3. Create a function `get_agent_profile` that receives the public key for the agent we are looking the profile for, and returns the profile in an `Option<Profile>`.

4. Create a function `get_my_profile` that doesn't receive any input parameters, and returns an `Option<Profile>` with out own profile if we have created it.

## Exercise 2: Comments zome

We are going to create a zome that manages comments attached to posts. A user should be able to:

- Create a comment attached to a particular post.
- Retrieve all the comments attached to a particular post.
- Delete a comment. This should be only available to its author.

Solve the next steps in the `comments` zome, in `dna/zomes/comments/lib.rs`.

1. Add a `Comment` struct, with only a `comment` field of type `String`.

- Annotate this struct with `#[hdk_entry]` to declare it as a Holochain entry.
- Add the `Comment` entry type to the `entry_defs![]` for the zome.

2. Create a function `create_comment` that receives a `CreateCommentInput` struct and returns the `HeaderHash` of the created comment.

- Define the `CreateCommentInput` as a struct that has two fields:
  - `comment_on`, of type `HeaderHash`. This refers the post that is being commented on.
  - `comment`, of type String, the actual comment.

3. Create a function `get_comments_on` that receives a `HeaderHash` for a post and returns all the comments that have been created for that post, in the form of a `Vec<Element>`.

4. Create a function `delete_comment` that receives the `HeaderHash` of the comment that is to be deleted, and deletes that comment.
