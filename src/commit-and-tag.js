const nodegit = require("nodegit");
const path = require("path");
const argv = require('minimist')(process.argv.slice(2));

async function commitAndTag(
    {
        Repository,
        Reference,
        Signature,
        Commit,
        Tag,
        Remote,
        Cred
    },
    name,
    author
) {

    const repo = await Repository.open(path.resolve(process.cwd(), ".git"));
    const index = await repo.refreshIndex();

    await index.addAll();
    await index.write();

    const oid = await index.writeTree();
    const head = await Reference.nameToId(repo, "HEAD");
    const parent = await repo.getCommit(head);

    const authorSig = Signature.create(author, author, Math.round(Date.now() / 1000), 0);
    const committerSig = Signature.create(author, author, Math.round(Date.now() / 1000), 0);

    const commitId = await repo.createCommit("HEAD", authorSig, committerSig, name, oid, [parent]);
    const commit = await Commit.lookup(repo, commitId);
    const tagId = await Tag.create(repo, name, commit, repo.defaultSignature(), name, 1);

    const remote = await Remote.create(repo, "origin", "git@github.com:johnlindquist/commit-and-tag.git");

    console.log(remote);

    await remote.push(["refs/heads/master:refs/heads/master"], {
        callbacks: {
            credentials: (url, username)=> Cred.sshKeyFromAgent(username)
        }
    });

    console.log("Tag: ", tagId);


}


const {name, author} = argv;
commitAndTag(nodegit, name, author);