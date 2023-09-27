import { Record, ActionHash } from "@holochain/client";
import { pause, runScenario, Scenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";
import _ from "lodash";
import test from "tape-promise/tape.js";
import { forumAppPath } from "./utils";

const isExercise = process.env["EXERCISE"] === "3";
const stepNum = isExercise && parseInt(process.env["STEP"] as string);

if (isExercise && stepNum === 1) {
  test("posts zome: profile is in entry defs", async (t) => {
    try {
      await runScenario(
        async (scenario: Scenario) => {
          // Construct proper paths for your DNAs.
          // This assumes DNA files created by the `hc dna pack` command.

          // Set up the app to be installed
          const appSource = { appBundleSource: { path: forumAppPath } };

          // Add 2 players with the test app to the Scenario. The returned players
          // can be destructured.
          const [alice, bob] = await scenario.addPlayersWithApps([
            appSource,
            appSource,
          ]);

          // Shortcut peer discovery through gossip and register all agents in every
          // conductor of the scenario.
          await scenario.shareAllAgents();
          console.log("Forum hApp - Exercise 3: Alice and Bob join the DHT");

          let entryDefs: any = await alice.cells[0].callZome({
            zome_name: "posts",
            fn_name: "entry_defs",
            payload: null,
          });

          t.equal(
            entryDefs.Defs.length,
            1,
            "entry_defs should have 1 entry def defined"
          );
        },
        true,
        { timeout: 50000 }
      );
    } catch (e) {
      console.log(e);
      process.kill(process.pid, "SIGINT");
    }
  });
}
if (isExercise && stepNum === 2) {
  test("posts zome: create_post", async (t) => {
    try {
      await runScenario(
        async (scenario: Scenario) => {
          // Construct proper paths for your DNAs.
          // This assumes DNA files created by the `hc dna pack` command.

          // Set up the app to be installed
          const appSource = { appBundleSource: { path: forumAppPath } };

          // Add 2 players with the test app to the Scenario. The returned players
          // can be destructured.
          const [alice, bob] = await scenario.addPlayersWithApps([
            appSource,
            appSource,
          ]);

          // Shortcut peer discovery through gossip and register all agents in every
          // conductor of the scenario.
          await scenario.shareAllAgents();
          console.log("Forum hApp - Exercise 3: Alice and Bob join the DHT");

          console.log("Forum hApp - Exercise 3: Alice tries to create a post");
          let postHash = await alice.cells[0].callZome({
            zome_name: "posts",
            fn_name: "create_post",
            payload: {
              post: {
                title: "This is my first post",
                content: "And I intend to make it good!",
              },
            },
          });

          t.ok(
            postHash,
            "create_post should return the action hash of the created post"
          );
        },
        true,
        { timeout: 50000 }
      );
    } catch (e) {
      console.log(e);
      process.kill(process.pid, "SIGINT");
    }
  });
}

if (isExercise && stepNum === 3) {
  test("posts zome: create_post", async (t) => {
    try {
      await runScenario(
        async (scenario: Scenario) => {
          // Construct proper paths for your DNAs.
          // This assumes DNA files created by the `hc dna pack` command.

          // Set up the app to be installed
          const appSource = { appBundleSource: { path: forumAppPath } };

          // Add 2 players with the test app to the Scenario. The returned players
          // can be destructured.
          const [alice, bob] = await scenario.addPlayersWithApps([
            appSource,
            appSource,
          ]);

          // Shortcut peer discovery through gossip and register all agents in every
          // conductor of the scenario.
          await scenario.shareAllAgents();
          console.log("Forum hApp - Exercise 3: Alice and Bob join the DHT");

          console.log("Forum hApp - Exercise 3: Alice tries to create a post");

          let postHash = await alice.cells[0].callZome({
            zome_name: "posts",
            fn_name: "create_post",
            payload: {
              post: {
                title: "This is my first post",
                content: "And I intend to make it good!",
              },
              channel: "general",
            },
          });

          t.ok(
            postHash,
            "create_post should return the action hash of the created post"
          );
        },
        true,
        { timeout: 50000 }
      );
    } catch (e) {
      console.log(e);
      process.kill(process.pid, "SIGINT");
    }
  });
}

export function extractEntry(record: Record): any {
  return decode((record.entry as any)?.Present.entry) as any;
}
if (isExercise && stepNum === 4) {
  test("posts zome: create_post creates a path for the channel", async (t) => {
    try {
      await runScenario(
        async (scenario: Scenario) => {
          // Construct proper paths for your DNAs.
          // This assumes DNA files created by the `hc dna pack` command.

          // Set up the app to be installed
          const appSource = { appBundleSource: { path: forumAppPath } };

          // Add 2 players with the test app to the Scenario. The returned players
          // can be destructured.
          const [alice, bob] = await scenario.addPlayersWithApps([
            appSource,
            appSource,
          ]);

          // Shortcut peer discovery through gossip and register all agents in every
          // conductor of the scenario.
          await scenario.shareAllAgents();
          console.log("Forum hApp - Exercise 3: Alice and Bob join the DHT");

          console.log("Forum hApp - Exercise 3: Alice tries to create a post");

          const post = {
            title: "This is my first post",
            content: "And I intend to make it good!",
          };

          let postHash = await alice.cells[0].callZome({
            zome_name: "posts",
            fn_name: "create_post",
            payload: {
              post,
              channel: "general",
            },
          });

          t.ok(postHash, "create_post should an action hash");

          let postRecord: Record = await alice.cells[0].callZome({
            zome_name: "posts",
            fn_name: "get_post",
            payload: postHash,
          });

          t.equal(
            extractEntry(postRecord),
            post,
            "create_post should return the action hash for the created post"
          );

          if (isExercise && stepNum < 7) return;

          // Wait for the created entry to be propagated to the other node.
          await pause(1000);
          console.log(
            "Forum hApp - Exercise 3: Alice tries to get all the channels"
          );

          let allChannels: Array<string> = await bob.cells[0].callZome({
            zome_name: "posts",
            fn_name: "get_all_channels",
            payload: null,
          });

          t.equal(
            allChannels.length,
            1,
            "create_post should create a path for the given channel"
          );
          t.equal(
            allChannels[0],
            "general",
            "create_post should create a path for the given channel of the form all_posts.<CHANNEL_NAME>"
          );
        },
        true,
        { timeout: 50000 }
      );
    } catch (e) {
      console.log(e);
      process.kill(process.pid, "SIGINT");
    }
  });
}

if (!isExercise || stepNum >= 6) {
  test("posts zome: create some posts and retrieve them", async (t) => {
    try {
      await runScenario(
        async (scenario: Scenario) => {
          // Construct proper paths for your DNAs.
          // This assumes DNA files created by the `hc dna pack` command.

          // Set up the app to be installed
          const appSource = { appBundleSource: { path: forumAppPath } };

          // Add 2 players with the test app to the Scenario. The returned players
          // can be destructured.
          const [alice, bob] = await scenario.addPlayersWithApps([
            appSource,
            appSource,
          ]);

          // Shortcut peer discovery through gossip and register all agents in every
          // conductor of the scenario.
          await scenario.shareAllAgents();
          console.log("Forum hApp - Exercise 3: Alice and Bob join the DHT");
          console.log(
            "Forum hApp - Exercise 3: Bob tries to get the posts for the 'general' channel"
          );

          let generalPosts: Array<ActionHash> = await bob.cells[0].callZome({
            zome_name: "posts",
            fn_name: "get_channel_posts",
            payload: "general",
          });

          t.equal(
            generalPosts.length,
            0,
            "get_channel_posts should return no posts if the given channel doesn't have any"
          );
          console.log(
            "Forum hApp - Exercise 3: Alice tries to create a post in the 'general' channel"
          );

          let postHash1 = await alice.cells[0].callZome({
            zome_name: "posts",
            fn_name: "create_post",
            payload: {
              post: {
                title: "This is my first post",
                content: "And I intend to make it good!",
              },
              channel: "general",
            },
          });

          t.ok(
            postHash1,
            "create_post should return the action hash of the created post"
          );

          // Wait for the created entry to be propagated to the other node.
          await pause(100);
          console.log(
            "Forum hApp - Exercise 3: Bob tries to create a post in the 'general' channel"
          );

          let postHash2 = await bob.cells[0].callZome({
            zome_name: "posts",
            fn_name: "create_post",
            payload: {
              post: {
                title: "This is my first post",
                content: "And I intend to make it good!",
              },
              channel: "general",
            },
          });

          t.ok(
            postHash2,
            "create_post should return the action hash of the created post"
          );

          if (isExercise && stepNum < 7) return;

          // Wait for the created entry to be propagated to the other node.
          await pause(1000);
          console.log("Forum hApp - Exercise 3: Bob tries to get all channels");

          let allChannels: Array<string> = await bob.cells[0].callZome({
            zome_name: "posts",
            fn_name: "get_all_channels",
            payload: null,
          });

          t.equal(
            allChannels.length,
            1,
            "create_post should create a path for the given channel"
          );
          t.equal(
            allChannels[0],
            "general",
            "create_post should create a path for the given channel of the form all_posts.<CHANNEL_NAME>"
          );

          console.log(
            "Forum hApp - Exercise 3: Bob tries to get the posts for the 'general' channel"
          );
          generalPosts = await bob.cells[0].callZome({
            zome_name: "posts",
            fn_name: "get_channel_posts",
            payload: "general",
          });

          t.equal(
            generalPosts.length,
            2,
            "get_channel_posts should return the appropriate amount of posts"
          );
          t.ok(
            generalPosts.find((postHash) => _.isEqual(postHash, postHash2)),
            "get_channel_posts should return the action hash of the created post"
          );
          t.ok(
            generalPosts.find((postHash) => _.isEqual(postHash, postHash1)),
            "get_channel_posts should return the action hash of the created post"
          );
        },
        true,
        { timeout: 50000 }
      );
    } catch (e) {
      console.log(e);
      process.kill(process.pid, "SIGINT");
    }
  });
}

if (!isExercise || stepNum >= 8) {
  test("posts zome: posts can be updated", async (t) => {
    try {
      await runScenario(
        async (scenario: Scenario) => {
          // Construct proper paths for your DNAs.
          // This assumes DNA files created by the `hc dna pack` command.

          // Set up the app to be installed
          const appSource = { appBundleSource: { path: forumAppPath } };

          // Add 2 players with the test app to the Scenario. The returned players
          // can be destructured.
          const [alice, bob] = await scenario.addPlayersWithApps([
            appSource,
            appSource,
          ]);

          // Shortcut peer discovery through gossip and register all agents in every
          // conductor of the scenario.
          await scenario.shareAllAgents();
          console.log("Forum hApp - Exercise 3: Alice and Bob join the DHT");

          console.log("Forum hApp - Exercise 3: Alice tries to create a post");

          let postHash = await alice.cells[0].callZome({
            zome_name: "posts",
            fn_name: "create_post",
            payload: {
              post: {
                title: "This is my first post",
                content: "And I intend to make it good!",
              },
              channel: "general",
            },
          });

          t.ok(
            postHash,
            "create_post should return the action hash of the created post"
          );

          // Wait for the created entry to be propagated to the other node.
          await pause(1000);

          console.log(
            "Forum hApp - Exercise 3: Alice tries to update their post"
          );
          let updatedPostHash: ActionHash = await alice.cells[0].callZome({
            zome_name: "posts",
            fn_name: "update_post",
            payload: {
              updated_post: {
                title: "This is an update to the first post",
                content: "I reconsidered the first content... That was wrong.",
              },
              post_to_update: postHash,
            },
          });

          t.ok(
            updatedPostHash,
            "update_post should return the action hash of the updated post"
          );

          // Wait for the created entry to be propagated to the other node.
          await pause(1000);
          console.log(
            "Forum hApp - Exercise 3: Alice tries to update their updated post"
          );

          updatedPostHash = await alice.cells[0].callZome({
            zome_name: "posts",
            fn_name: "update_post",
            payload: {
              updated_post: {
                title: "This is an update to the first post 2",
                content:
                  "I reconsidered the first content... That was wrong for the second time.",
              },
              post_to_update: updatedPostHash,
            },
          });

          t.ok(
            updatedPostHash,
            "update_post should return the action hash of the updated post"
          );

          // Wait for the created entry to be propagated to the other node.
          await pause(1000);
          console.log(
            "Forum hApp - Exercise 3: Alice tries to update their second updated post"
          );

          updatedPostHash = await alice.cells[0].callZome({
            zome_name: "posts",
            fn_name: "update_post",
            payload: {
              updated_post: {
                title: "This is an update to the first post 3 ",
                content:
                  "I reconsidered the first content... That was wrong for the third time",
              },
              post_to_update: updatedPostHash,
            },
          });

          t.ok(
            updatedPostHash,
            "update_post should return the action hash of the updated post"
          );

          // Wait for the created entry to be propagated to the other node.
          await pause(1000);
          console.log("Forum hApp - Exercise 3: Alice tries to get their post");

          let updatedPost: Record = await alice.cells[0].callZome({
            zome_name: "posts",
            fn_name: "get_post",
            payload: postHash,
          });

          t.ok(
            _.isEqual(extractActionHash(updatedPost), updatedPostHash),
            "update_post should update the original post, and get_post should return the latest version of the post"
          );
        },
        true,
        { timeout: 50000 }
      );
    } catch (e) {
      console.log(e);
      process.kill(process.pid, "SIGINT");
    }
  });
}

export function extractActionHash(record: Record): ActionHash {
  return (record as any).signed_action.hashed.hash;
}
