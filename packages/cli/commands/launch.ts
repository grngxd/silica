import { inject } from "+cli/util/inject";
import { confirm, log, outro, select, spinner } from "@clack/prompts";
import { exec } from "child-process-promise";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { CliCommand, CliFlag } from "../types";

const cliFlags: { [key: string]: CliFlag } = {
    client: {
        name: "client",
        description: "Which Discord client to use",
    },
    bypass: {
        name: "bypass",
        description: "Bypass confirmation prompt",
    },
    path: {
        name: "path",
        description: "Path to Silica bundle",
    }
};

enum DiscordClient {
    stable = "stable",
    canary = "canary",
    ptb = "ptb",
}

/**
 * Kills the specified Discord client based on the operating system.
 * @param client The Discord client to kill.
 * @param platform The current operating system platform.
 */
const killDiscord = async (client: DiscordClient, platform: string): Promise<void> => {
    let command: string;

    if (platform === "win32") {
        const processName = client === DiscordClient.stable ? "Discord.exe" : "DiscordCanary.exe";
        command = `taskkill /IM ${processName} /F`;
    } else if (platform === "darwin" || platform === "linux") {
        const processName = client === DiscordClient.stable ? "Discord" : "DiscordCanary";
        command = `pkill ${processName}`;
    } else {
        log.error("Unsupported platform for killing Discord.");
        return;
    }

    try {
        await exec(command);
        log.info(`Successfully killed ${client} Discord client.`);
    } catch (error: any) {
        log.warn(`Failed to kill ${client} Discord client or it wasn't running.`);
    }
};

const execute = async (argv: string[], flags: { [key: string]: any }) => {
    log.info("Launching Discord...");

    const possiblePaths = {
        stable: [
            path.join(os.homedir(), "AppData", "Local", "Discord"),
            "/Applications/Discord.app/Contents/MacOS/Discord",
            "/usr/share/discord/Discord",
        ],
        canary: [
            path.join(os.homedir(), "AppData", "Local", "DiscordCanary"),
            "/Applications/Discord Canary.app/Contents/MacOS/Discord Canary",
            "/usr/share/discord-canary/DiscordCanary",
        ],
        ptb: [
            path.join(os.homedir(), "AppData", "Local", "DiscordPTB"),
            "/Applications/Discord PTB.app/Contents/MacOS/Discord PTB",
            "/usr/share/discord-ptb/DiscordPTB",
        ],
    }

    let paths = {
        stable: "",
        canary: "",
        ptb: ""
    }

    const platform = os.platform();

    if (platform === "win32") {
        for (const client in possiblePaths) {
            const basePath = possiblePaths[client as keyof typeof possiblePaths][0];
            if (fs.existsSync(basePath)) {
                const dirs = fs.readdirSync(basePath).filter(dir => dir.startsWith("app-"));
                for (const dir of dirs) {
                    const exePath = path.join(basePath, dir, `${client === "stable" ? "Discord.exe" : "DiscordCanary.exe"}`);
                    if (fs.existsSync(exePath)) {
                        paths[client as keyof typeof paths] = exePath;
                        break;
                    }
                }
            }
        }
    } else {
        const glob = require("glob");
        for (const client in possiblePaths) {
            for (const possiblePath of possiblePaths[client as keyof typeof possiblePaths]) {
                log.info(`Checking path: ${possiblePath}`);
                const matches = glob.sync(possiblePath, { nocase: true });
                log.info(`Matches found: ${matches}`);
                if (matches.length > 0) {
                    paths[client as keyof typeof paths] = matches[0];
                    break;
                }
            }
        }
    }

    const discordClients = Object.entries(paths)
        .filter(([_, value]) => value !== "")
        .map(([client]) => client as keyof typeof DiscordClient);
    let selectedClient: DiscordClient | undefined = DiscordClient[flags.client as keyof typeof DiscordClient];

    if (discordClients.length > 1 && !selectedClient) {
        const selected = await select({
            message: "Which Discord client would you like to launch?",
            options: discordClients.map(client => ({ value: client, label: client })),
        });

        if (selected && selected in DiscordClient) {
            selectedClient = DiscordClient[selected as keyof typeof DiscordClient];
        } else {
            log.error("Invalid selection.");
            return;
        }
    } else if (discordClients.length === 1) {
        selectedClient = DiscordClient[discordClients[0]];
    }

    const bypass = flags.bypass !== undefined ? flags.bypass : await confirm({
        message: "Are you sure you want to launch Discord?",
        initialValue: false,
    })

    if (!bypass) {
        outro("Cancelled.");
        process.exit(2);
    }

    const s = spinner();

    if (selectedClient) {
        s.start(`Launching the ${selectedClient[0].toUpperCase() + selectedClient.substring(1)} Discord client.`);

        // Kill Discord cross-platformly
        await killDiscord(selectedClient, platform);

        try {
            const discordProcess = spawn(paths[selectedClient], ['--remote-debugging-port=4444'], {
                detached: true,
                stdio: 'ignore'
            });

            discordProcess.unref();
            
            s.stop(`Discord ${selectedClient[0].toUpperCase() + selectedClient.substring(1)} launched successfully.`);
        } catch (error: any) {
            s.stop(`Failed to launch Discord ${selectedClient[0].toUpperCase() + selectedClient.substring(1)}.`, 1);
            log.error(error.stderr || error.message);
            process.exit(1);
        }

        let script = flags.path ? fs.readFileSync(flags.path).toString() : await fetch("https://github.com/grngxd/silica/releases/latest/download/silica.js")
        .then(res => res.text())
        .catch(err => {
            s.stop("Failed to fetch Silica bundle.", 1);
            log.error(err);
            process.exit(1);
        });

        await inject(false, script);
    } else {
        s.stop("No Discord client selected.", 1);
        process.exit(1);
    }
};

export default {
    description: "Launch Discord",
    flags: Object.values(cliFlags),
    execute,
} as CliCommand;
