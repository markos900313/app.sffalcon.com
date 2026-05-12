
import fs from 'fs';

const content = fs.readFileSync('d:/SOPORTEFACIL/soportefacil/src/components/dashboard/onboarding/OnboardingModal.tsx', 'utf8');

let openDivs = 0;
let openBraces = 0;
let openParens = 0;

const lines = content.split('\n');
lines.forEach((line, i) => {
    const row = i + 1;
    // Count <div and </div
    const divOpens = (line.match(/<div/g) || []).length;
    const divCloses = (line.match(/<\/div/g) || []).length;
    openDivs += divOpens - divCloses;

    const braceOpens = (line.match(/\{/g) || []).length;
    const braceCloses = (line.match(/\}/g) || []).length;
    openBraces += braceOpens - braceCloses;

    const parenOpens = (line.match(/\(/g) || []).length;
    const parenCloses = (line.match(/\)/g) || []).length;
    openParens += parenOpens - parenCloses;

    if (openDivs < 0 || openBraces < 0 || openParens < 0) {
        console.log(`Negative balance at line ${row}: Divs: ${openDivs}, Braces: ${openBraces}, Parens: ${openParens}`);
    }
});

console.log(`Final Balance: Divs: ${openDivs}, Braces: ${openBraces}, Parens: ${openParens}`);
