# Angular-Tools AI Router

Use this file as the thin routing entry point for Angular-Tools tasks.

The maintained router lives at:
- `@24vlh/agents/agents-repo/angular-tools/AGENTS.md`

Load the maintained router for actual routing, source-of-truth files, and validation commands.
Do not duplicate the full router here.

## Path alias

Source of truth: `@24vlh/agents/path-roots.json`.

- `@24vlh` => WSL primary `/public_html/24vlh`
- `@24vlh` => Windows fallback `\\wsl.localhost\CentOS10\public_html\24vlh`
- `@24vlh` => legacy WSL fallback `/mnt/w/public_html/24vlh`
- `@24vlh` => legacy Windows fallback `W:/public_html/24vlh`

## Project root reference

- `@24vlh/angular-tools`

## Command execution policy (WSL-first, mandatory)

- Run commands through WSL shell:
  - `wsl sh -lc "cd /public_html/24vlh/angular-tools && <command>"`

## Routing

- Maintained router:
  - `@24vlh/agents/agents-repo/angular-tools/AGENTS.md`
- Emit:
  - `Routing: angular-tools + @24vlh/agents/agents-repo/angular-tools/AGENTS.md [+ other routers]`
