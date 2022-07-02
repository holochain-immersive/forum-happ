import { DnaSource, HeaderHash as ActionHash } from "@holochain/client";
import { pause, runScenario, Scenario } from "@holochain/tryorama";
import test from "tape-promise/tape.js";
import { forumDnaPath } from "./utils";

test("profiles zome: create profile and retrieve it", async (t) => {
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

      let profile: any = await bob.cells[0].callZome({
        zome_name: "profiles",
        fn_name: "get_agent_profile",
        payload: alice.agentPubKey,
      });
      t.notOk(profile, "should return null before Alice creates a profile");

      // The cells of the installed hApp are returned in the same order as the DNAs
      // that were passed into the player creation.
      await alice.cells[0].callZome({
        zome_name: "profiles",
        fn_name: "create_profile",
        payload: {
          nickname: "Alice",
        },
      });

      // Wait for the created entry to be propagated to the other node.
      await pause(100);

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
    });
  } catch (e) {
    console.log(e);
    process.kill(process.pid, "SIGINT");
  }
});
