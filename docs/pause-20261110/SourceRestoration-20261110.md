# WatchNest source restoration

Workspace maintenance removed the old checkout. The existing remote source was recovered successfully; unavailable historical local work was not claimed recovered.

Command executed from `/workspace/scratch/b4fb31747e8d`:

```sh
git clone --branch premium-ui-ux-20261103 --single-branch https://github.com/avromy/watchnest-.git watchnest
```

Verified with `git rev-parse HEAD HEAD^{tree}`, `git branch --show-current`, and `git status --short`:

- HEAD: `39ab79fe808bcac4f5eb343156d7f84c60fc7a00`
- Complete tree: `be0b2d9cd7c295ee90d4f9413e5d613346792843`
- Branch: `premium-ui-ux-20261103`
- Status: clean
- Remote: existing `https://github.com/avromy/watchnest-.git`
- 109 existing docs recovered.

No application changes, new branch, remote update, deployment, environment/data mutation, or ownership change. Existing production remains separate; this source checkout is the preserved UI candidate/evidence branch, not proof of deployment. Exact source is durably in GitHub; this local recipe is a reproducible recovery convenience.
