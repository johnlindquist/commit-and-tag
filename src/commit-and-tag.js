const nodegit = require("nodegit");
const path = require("path");
const argv = require('minimist')(process.argv.slice(2));

const {name, author} = argv;

async function commitAndTag() {
    const repo = await nodegit.Repository.open(path.resolve(process.cwd(), ".git"))
    const index = await repo.refreshIndex();

    await index.addAll();
    await index.write();
    const oid = await index.writeTree();
    const head = await nodegit.Reference.nameToId(repo, "HEAD")
    const parent = await repo.getCommit(head);

    const authorSig = nodegit.Signature.create(author,
        author, Math.round(Date.now() / 1000), 0);
    const committerSig = nodegit.Signature.create(author,
        author, Math.round(Date.now() / 1000), 0);

    const commitId = await repo.createCommit("HEAD", authorSig, committerSig, name, oid, [parent]);


    const commit = await nodegit.Commit.lookup(repo, commitId);

    const tagId = await nodegit.Tag.create(repo, name, commit, repo.defaultSignature(), name, 1)


    console.log("Tag: ", tagId);
}

commitAndTag();