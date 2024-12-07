import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node14',
  format: 'cjs',
  outdir: 'out',  
}).catch(() => process.exit(1)).then(() => {
  console.log('Build completed successfully!');
  process.exit(0);
})
