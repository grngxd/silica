export interface CliFlag {
    name: string;
    description: string;
    required?: boolean;
}

export interface CliCommand {
    description: string;
    flags?: CliFlag[];
    execute: (args: string[], flags: { [key: string]: any }) => Promise<void>;
}