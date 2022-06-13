
import { Orchestrator, Player, Cell } from "@holochain/tryorama";
import { config, installation, sleep } from '../../utils';

export default (orchestrator: Orchestrator<any>) =>  {
  
  orchestrator.registerScenario("comment CRUD tests", async (s, t) => {
    // Declare two players using the previously specified config, nicknaming them "alice" and "bob"
    // note that the first argument to players is just an array conductor configs that that will
    // be used to spin up the conductor processes which are returned in a matching array.
    const [alice_player, bob_player]: Player[] = await s.players([config, config]);

    // install your happs into the conductors and destructuring the returned happ data using the same
    // array structure as you created in your installation array.
    const [[alice_happ]] = await alice_player.installAgentsHapps(installation);
    const [[bob_happ]] = await bob_player.installAgentsHapps(installation);

    await s.shareAllNodes([alice_player, bob_player]);

    const alice = alice_happ.cells.find(cell => cell.cellRole.includes('/forum.dna')) as Cell;
    const bob = bob_happ.cells.find(cell => cell.cellRole.includes('/forum.dna')) as Cell;

    const entryContents = {
  "comment": "I gave it a cold? 'Cause maybe if we screw up this planet enough, they won't want it anymore! Forget the fat lady!"
};

    // Alice creates a comment
    const create_output = await alice.call(
        "comments",
        "create_comment",
        entryContents
    );
    t.ok(create_output.headerHash);
    t.ok(create_output.entryHash);

    await sleep(200);
    
    // Bob gets the created comment
    const entry = await bob.call("comments", "get_comment", create_output.entryHash);
    t.deepEqual(entry, entryContents);
    
    
    // Alice updates the comment
    const update_output = await alice.call(
      "comments",
      "update_comment",
      {
        originalHeaderHash: create_output.headerHash,
        updatedComment: {
          "comment": "I love to be directed. It's mysterious what attracts you to a person. It's mysterious what attracts you to a person."
}
      }
    );
    t.ok(update_output.headerHash);
    t.ok(update_output.entryHash);
    await sleep(200);

      
    
  });

}
