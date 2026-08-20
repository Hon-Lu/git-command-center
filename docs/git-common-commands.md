# Git 常用指令

## 目錄

- [Git 常用指令](#git-常用指令)
  - [目錄](#目錄)
  - [--force-with-lease：帶檢查機制的強制推送](#--force-with-lease帶檢查機制的強制推送)
  - [rebase --onto：把分支搬到新的 base](#rebase---onto把分支搬到新的-base)
    - [情境](#情境)
    - [指令](#指令)
    - [格式](#格式)
    - [對應到本情境](#對應到本情境)
    - [檢查](#檢查)
  - [修改已提交的 Commit 訊息](#修改已提交的-commit-訊息)
    - [修改最新一筆 Commit 訊息](#修改最新一筆-commit-訊息)
    - [修改更早之前的 Commit 訊息](#修改更早之前的-commit-訊息)
    - [常用格式](#常用格式)

---

## --force-with-lease：帶檢查機制的強制推送

用於本機已經改寫 commit 歷史，例如：

rebase
squash commit
amend commit
修改已推送過的 commit

當遠端分支已經存在舊紀錄時，一般 git push 會失敗，這時需要使用：

```bash
git push --force-with-lease
```

用途：

用本機目前的 commit 歷史覆蓋遠端分支，
但如果遠端分支已經被其他人更新過，Git 會阻止推送。

比 --force 安全，因為不會直接覆蓋別人剛推上去的 commit。

---

## rebase --onto：把分支搬到新的 base

> 類似把某個分支自己的 commits 手動 cherry-pick 到另一個 base 上，但用 rebase 一次完成。

### 情境

```text
main
 └─ A-1
     └─ A-2
```

`A-2` 是從 `A-1` 切出來的。
當 `A-1` 已經 merge 回 `main` 後，希望讓 `A-2` 改成直接接在最新的 `main` 後面。

### 指令

```bash
git checkout A-2
git fetch origin
git rebase --onto origin/main A-1 A-2
git push --force-with-lease
```

### 格式

```bash
git rebase --onto <新的底> <舊的底> <要搬的分支>
```

### 對應到本情境

```bash
git rebase --onto origin/main A-1 A-2
```

意思是：

```text
把 A-2 上「A-1 之後才新增的 commits」
搬到 origin/main 後面
```

### 檢查

```bash
git log --oneline origin/main..A-2
git diff origin/main...A-2
```

---

## 修改已提交的 Commit 訊息

### 修改最新一筆 Commit 訊息

如果只是要修改目前最新一筆 commit 的訊息：

```bash
git commit --amend -m "新的 commit 訊息"
```

例如：

```bash
git commit --amend -m "fix: 修正登入頁面錯誤"
```

這會修改最新一筆 commit 的訊息。

> `amend` 會產生新的 commit hash，即使檔案內容沒有變更。

如果這筆 commit **還沒 push 到遠端**，修改完直接正常 push：

```bash
git push
```

如果這筆 commit **已經 push 過遠端**，因為 commit hash 已經改變，需要：

```bash
git push --force-with-lease
```

### 修改更早之前的 Commit 訊息

如果要修改的不是最新一筆 commit，可以使用 interactive rebase：

```bash
git rebase -i HEAD~3
```

`HEAD~3` 代表查看最近 3 筆 commits。

例如原本看到：

```text
pick abc1234 feat: add login
pick def5678 fix: login bug
pick ghi9012 refactor: login flow
```

把想修改訊息的 commit 從：

```text
pick
```

改成：

```text
reword
```

例如：

```text
pick abc1234 feat: add login
reword def5678 fix: login bug
pick ghi9012 refactor: login flow
```

儲存並離開後，Git 會讓你重新輸入該 commit 的訊息。

修改完成後，如果這些 commits **已經 push 過遠端**：

```bash
git push --force-with-lease
```

### 常用格式

修改最新一筆：

```bash
git commit --amend -m "新的 commit 訊息"
```

修改最近 N 筆中的某一筆：

```bash
git rebase -i HEAD~N
```

將目標 commit：

```text
pick
```

改成：

```text
reword
```

如果已推送到遠端：

```bash
git push --force-with-lease
```