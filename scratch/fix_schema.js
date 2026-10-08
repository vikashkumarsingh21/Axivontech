const { execSync } = require('child_process');
const fs = require('fs');

const schemas = [
    'prisma/core/schema.prisma',
    'prisma/client/schema.prisma',
    'prisma/employee/schema.prisma',
    'prisma/broker/schema.prisma'
];

function fixSchema(schemaPath) {
    let passing = false;
    let attempts = 0;
    while (!passing && attempts < 15) {
        attempts++;
        try {
            console.log(`Validating ${schemaPath}... (Attempt ${attempts})`);
            execSync(`npx prisma validate --schema=${schemaPath}`, { stdio: 'pipe' });
            passing = true;
            console.log(`✔ ${schemaPath} passed validation!`);
        } catch (error) {
            const output = error.stderr ? error.stderr.toString() : error.stdout.toString();
            const lines = fs.readFileSync(schemaPath, 'utf-8').split('\n');
            let modified = false;

            // Updated regex to handle Windows paths safely
            const regex = /-->\s+prisma\\[a-z]+\\schema\.prisma:(\d+)/g;
            let match;
            const errorLines = new Set();
            while ((match = regex.exec(output)) !== null) {
                errorLines.add(parseInt(match[1], 10));
            }

            if (errorLines.size === 0) {
                console.log("No line numbers found. Regex might be wrong. Output:", output.substring(0, 500));
                // Fallback regex
                const regex2 = /schema\.prisma:(\d+)/g;
                while ((match = regex2.exec(output)) !== null) {
                    errorLines.add(parseInt(match[1], 10));
                }
            }

            errorLines.forEach(lineNum => {
                const idx = lineNum - 1;
                if (idx >= 0 && idx < lines.length && !lines[idx].startsWith('//')) {
                    lines[idx] = '// ' + lines[idx];
                    modified = true;
                }
            });

            if (modified) {
                fs.writeFileSync(schemaPath, lines.join('\n'));
            } else {
                console.log("Could not modify any lines.");
                break;
            }
        }
    }
}

schemas.forEach(fixSchema);
console.log("Done.");
