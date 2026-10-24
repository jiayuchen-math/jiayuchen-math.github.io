import fs from 'node:fs';
export const calculusRevision=JSON.parse(fs.readFileSync(new URL('./data/calculus-revisions.json',import.meta.url),'utf8'));
export const priorCalculusSources=Object.fromEntries(calculusRevision.archives.map(e=>[e.file,e.original]));
export const addedCalculusRevisionFiles=new Set(calculusRevision.addedFiles);
