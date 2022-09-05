// 参考: https://qiita.com/meno-m/items/47cb79e1d7c892727f3c

// ↓githubのREST API ライブラリ
const { Octokit } = require("@octokit/rest");
// githubに草を生やす関数
async function growGrassToGithub() {
  try {
    // TODO 設定を編集する
    await gitCommitPush({
      token: "_personal_access_token_",
      owner: "_owner_name_",
      repo: "_repository_name_",
      file: {
        path: "_file_name_.md",
        content: `草生やしたったwww ${new Date().toLocaleString()}`,
      },
      branch: "main",
      commitMessage: "grow grass for bot",
    });

    console.log("success grow glass");
    return `草生やしたったwww`;
  } catch (error) {
    console.error(error);
    return `草生やすの失敗したったwww`;
  }
}

// github 系
const gitCommitPush = async (config) => {
  const gh = new Octokit({
    auth: config.token,
  });

  const ref = await gh.git.getRef({
    owner: config.owner,
    repo: config.repo,
    ref: `heads/${config.branch}`,
  });
  const parentSha = ref.data.object.sha;
  const parentCommit = await gh.git.getCommit({
    owner: config.owner,
    repo: config.repo,
    commit_sha: parentSha,
  });
  const createBlob = await gh.git.createBlob({
    owner: config.owner,
    repo: config.repo,
    content: config.file.content,
    encoding: "utf-8",
  });
  const createTree = await gh.git.createTree({
    owner: config.owner,
    repo: config.repo,
    base_tree: parentCommit.data.tree.sha,
    tree: [
      {
        path: config.file.path,
        sha: createBlob.data.sha,
        mode: `100644`,
        type: `blob`,
      },
    ],
  });

  const createCommit = await gh.git.createCommit({
    message: config.commitMessage,
    owner: config.owner,
    repo: config.repo,
    parents: [parentSha],
    tree: createTree.data.sha,
  });

  const updateRef = await gh.git.updateRef({
    owner: config.owner,
    repo: config.repo,
    ref: `heads/${config.branch}`,
    sha: createCommit.data.sha,
  });

  console.log("commit success:", updateRef.data);
};

const message = growGrassToGithub();
console.log(message);
