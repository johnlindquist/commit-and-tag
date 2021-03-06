#!/usr/bin/env node

/*
 Usage:
 commit-and-tag
 --author github-username
 --password yourgithubpassword
 --repo your-repo
 --name tag-name
 */


const nodegit = require("nodegit");
const path = require("path");
const argv = require('minimist')(process.argv.slice(2));
const openurl = require("openurl");

async function commitAndTag({
    Repository,
    Reference,
    Signature,
    Commit,
    Tag,
    Remote,
    Cred
},
    {
        name,
        author,
        password
    }) {

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

    console.log(tagId);

    const remote = await Remote.lookup(repo, "origin");

    const tagRef = `refs/tags/${name}`;

    console.log(tagRef);

    await remote.push([
        `+${tagRef}:${tagRef}`
    ], {
        callbacks: {
            credentials: (url, username)=> {
                const creds = Cred.userpassPlaintextNew(author, password);
                console.log(creds);
                return creds;
            }
        }
    });
}


async function go() {
    const {repo, name, author} = argv;

    await commitAndTag(nodegit, argv);
    openurl.open(`https://embed.plnkr.co/github/${author}/${repo}/${name}`)
}

go();



