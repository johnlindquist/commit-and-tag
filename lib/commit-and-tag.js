let commitAndTag = (() => {
    var _ref = _asyncToGenerator(function* (name, author) {
        const repo = yield nodegit.Repository.open(path.resolve(process.cwd(), ".git"));
        const index = yield repo.refreshIndex();

        yield index.addAll();
        yield index.write();

        const oid = yield index.writeTree();
        const head = yield nodegit.Reference.nameToId(repo, "HEAD");
        const parent = yield repo.getCommit(head);

        const authorSig = nodegit.Signature.create(author, author, Math.round(Date.now() / 1000), 0);
        const committerSig = nodegit.Signature.create(author, author, Math.round(Date.now() / 1000), 0);

        const commitId = yield repo.createCommit("HEAD", authorSig, committerSig, name, oid, [parent]);
        const commit = yield nodegit.Commit.lookup(repo, commitId);
        const tagId = yield nodegit.Tag.create(repo, name, commit, repo.defaultSignature(), name, 1);

        console.log("Tag: ", tagId);
    });

    return function commitAndTag(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const nodegit = require("nodegit");
const path = require("path");
const argv = require('minimist')(process.argv.slice(2));

const { name, author } = argv;
commitAndTag(name, author);