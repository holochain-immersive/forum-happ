import { pause, runScenario, Scenario } from "@holochain/tryorama";
import test from "tape-promise/tape.js";
import { forumAppPath } from "./utils";

const isExercise = process.env["EXERCISE"] === "1";
const stepNum = isExercise && parseInt(process.env["STEP"] as string);

test("profiles zome: create profile and retrieve it", async (t) => {
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

        console.log("Forum hApp - Exercise 1: Alice and Bob join the DHT");

        try {
          let entryDefs: any = await bob.cells[0].callZome({
            zome_name: "profiles",
            fn_name: "entry_defs",
            payload: null,
          });
          t.equal(entryDefs.Defs.length, 1, "should have one entry definition");
        } catch (e) {
          throw new Error("There are no entries defined in the profiles zome");
        }

        if (isExercise && stepNum === 1) return;

        console.log(
          "Forum hApp - Exercise 1: Bob tries to get Alice's profile"
        );

        let profile: any = await bob.cells[0].callZome({
          zome_name: "profiles",
          fn_name: "get_agent_profile",
          payload: alice.agentPubKey,
        });
        t.notOk(
          profile,
          "get_agent_profile should return null before Alice creates a profile"
        );

        console.log("Forum hApp - Exercise 1: Alice creates a profile");
        // The cells of the installed hApp are returned in the same order as the DNAs
        // that were passed into the player creation.
        const profileActionHash = await alice.cells[0].callZome({
          zome_name: "profiles",
          fn_name: "create_profile",
          payload: {
            nickname: "Alice",
          },
        });
        t.ok(
          profileActionHash,
          "create_profile should return the action hash for the create action"
        );

        if (isExercise && stepNum === 2) return;

        // Wait for the created entry to be propagated to the other node.
        await pause(1000);

        console.log(
          "Forum hApp - Exercise 1: Bob tries to get Alice's profile"
        );
        profile = await bob.cells[0].callZome({
          zome_name: "profiles",
          fn_name: "get_agent_profile",
          payload: alice.agentPubKey,
        });
        t.equal(
          profile.nickname,
          "Alice",
          'nickname for Alice should be "Alice"'
        );

        console.log(
          "Forum hApp - Exercise 1: Alice tries to get their own profile"
        );
        profile = await alice.cells[0].callZome({
          zome_name: "profiles",
          fn_name: "get_my_profile",
          payload: null,
        });
        t.equal(
          profile.nickname,
          "Alice",
          'nickname for Alice should be "Alice"'
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
