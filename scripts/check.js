#!/usr/bin/env node
// Quick sanity check — lists all created files
const { execSync } = require("child_process");
const out = execSync("find src supabase -type f | sort", { cwd: __dirname }).toString();
console.log(out);
console.log("Total files:", out.trim().split("\n").length);
