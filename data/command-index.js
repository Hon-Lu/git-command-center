window.GIT_COMMANDS = [
  {
    id: 'rebase-onto',
    script: 'commands/rebase-onto.js',
    title: 'rebase --onto',
    label: '把分支搬到新的 base',
    description: '填入新的底、舊的底與要搬的分支，產生完整 rebase 流程與檢查指令。',
    category: 'rebase',
    categoryLabel: 'Rebase',
    icon: 'branch',
    accent: 'blue',
    tags: ['互動產生器', '3 個分支'],
    keywords: ['rebase', 'onto', 'base', 'branch', '分支', '搬移', '新的底', '舊的底', 'A-1', 'A-2']
  },
  {
    id: 'force-with-lease',
    script: 'commands/force-with-lease.js',
    title: '--force-with-lease',
    label: '帶檢查機制的強制推送',
    description: '改寫 commit 歷史後，以較安全的方式更新遠端分支。',
    category: 'push',
    categoryLabel: 'Push',
    icon: 'shield',
    accent: 'green',
    tags: ['一鍵複製', '安全推送'],
    keywords: ['force', 'lease', 'push', 'remote', '遠端', '強制推送', 'rebase', 'squash', 'amend']
  },
  {
    id: 'commit-message',
    script: 'commands/commit-message.js',
    title: '修改 Commit 訊息',
    label: 'amend 與 interactive rebase',
    description: '依照「最新一筆」或「更早之前」產生正確的修改與推送指令。',
    category: 'commit',
    categoryLabel: 'Commit',
    icon: 'pencil',
    accent: 'orange',
    tags: ['雙模式', '即時產生'],
    keywords: ['commit', 'message', 'amend', 'reword', 'interactive', 'rebase', '訊息', '提交', 'HEAD']
  }
];
