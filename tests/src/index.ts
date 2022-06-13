import { Orchestrator } from "@holochain/tryorama";

import profiles_profile from './forum/profiles/profile';
import posts_post from './forum/posts/post';
import comments_comment from './forum/comments/comment';

let orchestrator: Orchestrator<any>;

orchestrator = new Orchestrator();
profiles_profile(orchestrator);
orchestrator.run();

orchestrator = new Orchestrator();
posts_post(orchestrator);
orchestrator.run();

orchestrator = new Orchestrator();
comments_comment(orchestrator);
orchestrator.run();



