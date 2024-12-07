import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

export const prebuild = () => {
    fs.rmSync(path.resolve(__dirname, '../../out'), { recursive: true, force: true });
    fs.rmSync(path.resolve(__dirname, '../silica/out'), { recursive: true, force: true });
    fs.rmSync(path.resolve(__dirname, '../cli/out'), { recursive: true, force: true });
};

if (pathToFileURL(process.argv[1]).href === import.meta.url) {
    prebuild();
}