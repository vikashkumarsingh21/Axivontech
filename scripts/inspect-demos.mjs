import fs from 'fs';

const content = fs.readFileSync('src/data/demo-projects.ts', 'utf8');

// Extract all demo blocks
const blocks = content.split(/\{\s*id:\s*"/g).slice(1);
console.log(`Found ${blocks.length} demo definitions.`);

const demos = [];
for (const b of blocks) {
  const idMatch = b.match(/^([^"]+)"/);
  const nameMatch = b.match(/name:\s*"([^"]+)"/);
  const catMatch = b.match(/category:\s*"([^"]+)"/);
  const statusMatch = b.match(/status:\s*"([^"]+)"/);
  const urlMatch = b.match(/demoUrl:\s*"([^"]+)"/);
  const slugMatch = b.match(/slug:\s*"([^"]+)"/);

  if (idMatch && nameMatch) {
    demos.push({
      id: idMatch[1],
      name: nameMatch[1],
      category: catMatch ? catMatch[1] : 'Unknown',
      status: statusMatch ? statusMatch[1] : 'Unknown',
      demoUrl: urlMatch ? urlMatch[1] : '',
      slug: slugMatch ? slugMatch[1] : idMatch[1]
    });
  }
}

console.log('--- ALL DEMOS ---');
console.table(demos);

const liveDemos = demos.filter(d => d.status === 'Live Demo');
console.log(`\nLIVE DEMOS (${liveDemos.length}):`);
console.table(liveDemos);
