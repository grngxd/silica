import {
    cancel,
    intro,
    log,
    outro
} from "@clack/prompts";
import minimist from "minimist";
import color from "picocolors";
import * as cmds from "./commands";
import { CliCommand } from "./types";

const init = performance.now();

const typedCmds: { [key: string]: CliCommand } = cmds;

async function main() {
    console.log();
    intro(color.inverse(" silica-cli "));

    if (process.argv.length > 2) {
        const args = process.argv.slice(2);
        const parsedArgs = minimist(args);
        const commandName = parsedArgs._[0];
        const commandArgs = parsedArgs._.slice(1);
        const commandFlags = parsedArgs;

        if (commandName in typedCmds) {
            await typedCmds[commandName].execute(commandArgs, commandFlags);
        } else {
            cancel(`Command "${commandName}" not found.`);

            // Show help
            showHelp();
        }
    } else {
        // Show help
        showHelp();
    }

    outro(`Done! (${((performance.now() - init) / 1000).toFixed(2)}s)`);
}

function showHelp() {
    log.info("Usage: silica-cli <command> [options]");
    const commandsTxt = `Commands:\n${Object.keys(typedCmds).map(cmd => {
        const command = typedCmds[cmd];
        const flagsTxt = command.flags ? command.flags.map(flag => `    ${flag.required == true ? "*" : ""}--${flag.name}: ${flag.description}`).join("\n") : "";
        return `  ${cmd}: ${command.description}\n${flagsTxt}`;
    }).join("\n")}`;
    log.info(commandsTxt);
}

main().catch((e) => { cancel(e.message); process.exit(1); });