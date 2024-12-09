import { inject } from '+cli/util/inject';
import { prebuild } from '+scripts/prebuild';
import { context } from 'esbuild';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const watchMode = args.includes('--watch');

(async () => {
    const ctx = await context({
        entryPoints: ['./core/index.ts'],
        bundle: true,
        outfile: './out/silica.js',
        platform: 'browser',
        target: 'ES2020',
        format: 'iife',
        // minify: true,
        plugins: [{
            name: 'rebuild-notify',
            setup(build) {
                build.onEnd(result => {
                    console.log(`Build Complete. ${result.errors.length} errors, ${result.warnings.length} warnings`);
                    if (watchMode)  inject(true, readFileSync('./out/silica.js').toString());
                    else {
                        process.exit(0);
                    }
                })
            },
        },
        ],
    });

    if (watchMode) {
        await ctx.watch();
        console.log('Watching...');
    } else {
        prebuild();
        await ctx.rebuild();
    }
})();