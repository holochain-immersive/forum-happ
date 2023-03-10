import { ActionHash } from "@holochain/client";
import { pause, runScenario, Scenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";
import test from "tape-promise/tape.js";
import { forumAppPath } from "./utils";

const isExercise = process.env["EXERCISE"] === "2";
const stepNum = isExercise && parseInt(process.env["STEP"] as string);

test("comments zome: create and retrieve comments", async (t) => {
  try {
    await runScenario(async (scenario: Scenario) => {
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

      const postHash: ActionHash = await alice.cells[0].callZome({
        zome_name: "posts",
        fn_name: "create_post",
        payload: {
          post: {
            title: "A good post!",
            content: "I hope you like it :)",
          },
          channel: "general",
        },
      });

      // Wait for the created entry to be propagated to the other node.
      await pause(1000);

      if (!(isExercise && stepNum < 4)) {
        let emptyComments: Array<any> = await bob.cells[0].callZome({
          zome_name: "comments",
          fn_name: "get_comments_on",
          payload: postHash,
        });
        t.equal(
          emptyComments.length,
          0,
          "get_comments_on should not return any comments for a newly created post"
        );
      }

      let entryDefs: any = await alice.cells[0].callZome({
        zome_name: "comments",
        fn_name: "entry_defs",
        payload: null,
      });

      t.equal(
        entryDefs.Defs.length,
        1,
        "entry_defs should have 1 entry def defined"
      );

      if (isExercise && stepNum === 1) return;

      const commentHash = await bob.cells[0].callZome({
        zome_name: "comments",
        fn_name: "create_comment",
        payload: {
          comment_on: postHash,
          comment: "Oh yes I like it!",
        },
      });
      t.ok(
        commentHash,
        "create_comment should return the action hash of the created comment"
      );
      if (isExercise && stepNum === 2) return;

      // let linkTypes: number = await alice.cells[0].callZome({
      //   zome_name: "comments",
      //   fn_name: "__num_link_types",
      //   payload: null,
      // });

      // t.equal(
      //   linkTypes,
      //   1,
      //   "the comments zome should have 1 link type defined"
      // );

      if (isExercise && stepNum === 3) return;

      // Wait for the created entry to be propagated to the other node.
      await pause(1000);

      let comments: Array<any> = await bob.cells[0].callZome({
        zome_name: "comments",
        fn_name: "get_comments_on",
        payload: postHash,
      });
      t.equal(
        comments.length,
        1,
        "get_comments_on should return the appropriate amount of comments"
      );
      t.equal(
        (decode(comments[0].entry.Present.entry) as any).comment,
        "Oh yes I like it!",
        "get_comments_on should return the appropriate contents of the comments"
      );

      await bob.cells[0].callZome({
        zome_name: "comments",
        fn_name: "delete_comment",
        payload: commentHash,
      });

      comments = await bob.cells[0].callZome({
        zome_name: "comments",
        fn_name: "get_comments_on",
        payload: postHash,
      });
      t.equal(
        comments.length,
        0,
        "get_comments_on should not return any comments after the comment is deleted"
      );
    });
  } catch (e) {
    console.log(e);
    process.kill(process.pid, "SIGINT");
  }
});
