import { DnaSource, Record, ActionHash } from "@holochain/client";
import { pause, runScenario, Scenario } from "@holochain/tryorama";
import _ from "lodash";
import test from "tape-promise/tape.js";
import { forumDnaPath } from "./utils";

const isExercise = process.env["EXERCISE"] === "3";
const stepNum = isExercise && parseInt(process.env["STEP"] as string);

if (isExercise && stepNum === 1) {
  test("posts zome: profile is in entry defs", async (t) => {
    try {
      await runScenario(async (scenario: Scenario) => {
        // Construct proper paths for your DNAs.
        // This assumes DNA files created by the `hc dna pack` command.

        // Set up the array of DNAs to be installed, which only consists of the
        // test DNA referenced by path.
        const dnas: DnaSource[] = [{ path: forumDnaPath }];

        // Add 2 players with the test DNA to the Scenario. The returned players
        // can be destructured.
        const [alice, bob] = await scenario.addPlayersWithHapps([dnas, dnas]);

        // Shortcut peer discovery through gossip and register all agents in every
        // conductor of the scenario.
        await scenario.shareAllAgents();

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
      });
    } catch (e) {
      console.log(e);
      process.kill(process.pid, "SIGINT");
    }
  });
}
if (isExercise && stepNum === 2) {
  test("posts zome: create_post", async (t) => {
    try {
      await runScenario(async (scenario: Scenario) => {
        // Construct proper paths for your DNAs.
        // This assumes DNA files created by the `hc dna pack` command.

        // Set up the array of DNAs to be installed, which only consists of the
        // test DNA referenced by path.
        const dnas: DnaSource[] = [{ path: forumDnaPath }];

        // Add 2 players with the test DNA to the Scenario. The returned players
        // can be destructured.
        const [alice, bob] = await scenario.addPlayersWithHapps([dnas, dnas]);

        // Shortcut peer discovery through gossip and register all agents in every
        // conductor of the scenario.
        await scenario.shareAllAgents();

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
      });
    } catch (e) {
      console.log(e);
      process.kill(process.pid, "SIGINT");
    }
  });
}

if (isExercise && stepNum === 3) {
  test("posts zome: create_post", async (t) => {
    try {
      await runScenario(async (scenario: Scenario) => {
        // Construct proper paths for your DNAs.
        // This assumes DNA files created by the `hc dna pack` command.

        // Set up the array of DNAs to be installed, which only consists of the
        // test DNA referenced by path.
        const dnas: DnaSource[] = [{ path: forumDnaPath }];

        // Add 2 players with the test DNA to the Scenario. The returned players
        // can be destructured.
        const [alice, bob] = await scenario.addPlayersWithHapps([dnas, dnas]);

        // Shortcut peer discovery through gossip and register all agents in every
        // conductor of the scenario.
        await scenario.shareAllAgents();

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
      });
    } catch (e) {
      console.log(e);
      process.kill(process.pid, "SIGINT");
    }
  });
}

if (isExercise && stepNum === 4) {
  test("posts zome: create_post creates a path for the channel", async (t) => {
    try {
      await runScenario(async (scenario: Scenario) => {
        // Construct proper paths for your DNAs.
        // This assumes DNA files created by the `hc dna pack` command.

        // Set up the array of DNAs to be installed, which only consists of the
        // test DNA referenced by path.
        const dnas: DnaSource[] = [{ path: forumDnaPath }];

        // Add 2 players with the test DNA to the Scenario. The returned players
        // can be destructured.
        const [alice, bob] = await scenario.addPlayersWithHapps([dnas, dnas]);

        // Shortcut peer discovery through gossip and register all agents in every
        // conductor of the scenario.
        await scenario.shareAllAgents();

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

        if (isExercise && stepNum < 7) return;

        // Wait for the created entry to be propagated to the other node.
        await pause(100);

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
      });
    } catch (e) {
      console.log(e);
      process.kill(process.pid, "SIGINT");
    }
  });
}

if (!isExercise || stepNum >= 5) {
  test("posts zome: create some posts and retrieve them", async (t) => {
    try {
      await runScenario(async (scenario: Scenario) => {
        // Construct proper paths for your DNAs.
        // This assumes DNA files created by the `hc dna pack` command.

        // Set up the array of DNAs to be installed, which only consists of the
        // test DNA referenced by path.
        const dnas: DnaSource[] = [{ path: forumDnaPath }];

        // Add 2 players with the test DNA to the Scenario. The returned players
        // can be destructured.
        const [alice, bob] = await scenario.addPlayersWithHapps([dnas, dnas]);

        // Shortcut peer discovery through gossip and register all agents in every
        // conductor of the scenario.
        await scenario.shareAllAgents();

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
        await pause(100);

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
          _.isEqual(generalPosts[0], postHash2),
          "get_channel_posts should return the action hash of the created post"
        );
        t.ok(
          _.isEqual(generalPosts[1], postHash1),
          "get_channel_posts should return the action hash of the created post"
        );
      });
    } catch (e) {
      console.log(e);
      process.kill(process.pid, "SIGINT");
    }
  });
}

if (!isExercise || stepNum >= 8) {
  test("posts zome: posts can be updated", async (t) => {
    try {
      await runScenario(async (scenario: Scenario) => {
        // Construct proper paths for your DNAs.
        // This assumes DNA files created by the `hc dna pack` command.

        // Set up the array of DNAs to be installed, which only consists of the
        // test DNA referenced by path.
        const dnas: DnaSource[] = [{ path: forumDnaPath }];

        // Add 2 players with the test DNA to the Scenario. The returned players
        // can be destructured.
        const [alice, bob] = await scenario.addPlayersWithHapps([dnas, dnas]);

        // Shortcut peer discovery through gossip and register all agents in every
        // conductor of the scenario.
        await scenario.shareAllAgents();

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
        await pause(100);

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
        await pause(100);

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
        await pause(100);

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
        await pause(100);

        let updatedPost: Record = await alice.cells[0].callZome({
          zome_name: "posts",
          fn_name: "get_post",
          payload: postHash,
        });

        t.ok(
          _.isEqual(extractActionHash(updatedPost), updatedPostHash),
          "update_post should update the original post, and get_post should return the latest version of the post"
        );
      });
    } catch (e) {
      console.log(e);
      process.kill(process.pid, "SIGINT");
    }
  });
}

export function extractActionHash(record: Record): ActionHash {
  return (record as any).signed_action.hashed.hash;
}
