#!/usr/bin/env node
let commitAndTag = (() => {
    var _ref = _asyncToGenerator(function* ({
        Repository,
        Reference,
        Signature,
        Commit,
        Tag,
        Remote,
        Cred,
        Branch
    }, {
        name,
        author,
        password
    }) {

        const repo = yield Repository.open(path.resolve(process.cwd(), ".git"));

        console.log(repo);

        const index = yield repo.refreshIndex();

        yield index.addAll();
        yield index.write();

        const oid = yield index.writeTree();
        const head = yield Reference.nameToId(repo, "HEAD");
        const parent = yield repo.getCommit(head);

        const authorSig = Signature.create(author, author, Math.round(Date.now() / 1000), 0);
        const committerSig = Signature.create(author, author, Math.round(Date.now() / 1000), 0);

        const commitId = yield repo.createCommit("HEAD", authorSig, committerSig, name, oid, [parent]);
        const commit = yield Commit.lookup(repo, commitId);

        Branch.name(commitId).then(function (name) {
            console.log(name);
        }).catch(function (err) {
            return console.log(err);
        });

        const tagId = yield Tag.create(repo, name, commit, repo.defaultSignature(), name, 1);

        const remote = yield Remote.lookup(repo, "origin");

        const tagRef = `refs/tags/${ name }`;
        yield remote.push(["refs/heads/master:refs/heads/master", `${ tagRef }:${ tagRef }`], {
            callbacks: {
                credentials: function (url, username) {
                    const creds = Cred.userpassPlaintextNew(author, password);
                    console.log(creds);
                    return creds;
                }
            }
        });
    });

    return function commitAndTag(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

let go = (() => {
    var _ref2 = _asyncToGenerator(function* () {
        const { repo, name, author } = argv;

        yield commitAndTag(nodegit, argv);
        openurl.open(`https://embed.plnkr.co/github/${ author }/${ repo }/${ name }`);
    });

    return function go() {
        return _ref2.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/*
 Usage:
 node lib\commit-and-tag.js
 --author github-username
 --name tagname
 --password yourgithubpassword
 --repo your-reop

 */

const nodegit = require("nodegit");
const path = require("path");
const argv = require('minimist')(process.argv.slice(2));
const openurl = require("openurl");

go();