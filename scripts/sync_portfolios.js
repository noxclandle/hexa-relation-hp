const fs = require('fs');
const path = require('path');

const SAVE_DIR = path.join(__dirname, '../save');
const NOX_INDEX = path.join(SAVE_DIR, 'nox/index.html');

function sync() {
    console.log('Starting portfolio sync...');

    // 1. Scan save directory
    const portfolios = fs.readdirSync(SAVE_DIR)
        .filter(dir => dir !== 'nox' && fs.statSync(path.join(SAVE_DIR, dir)).isDirectory())
        .map(dir => {
            const indexPath = path.join(SAVE_DIR, dir, 'index.html');
            let title = dir.toUpperCase();
            let theme = 'Unknown Style';
            
            if (fs.existsSync(indexPath)) {
                const content = fs.readFileSync(indexPath, 'utf-8');
                const titleMatch = content.match(/<title>(.*?)<\/title>/);
                if (titleMatch) {
                    const fullTitle = titleMatch[1];
                    if (fullTitle.includes('|')) {
                        title = fullTitle.split('|')[1].replace(' Portfolio', '').trim();
                    } else if (fullTitle.includes('-')) {
                        title = fullTitle.split('-')[0].trim();
                    } else {
                        title = fullTitle;
                    }
                }
                
                // Try to guess theme from title or content
                if (content.includes('FF14')) theme = 'FF14風';
                else if (content.includes('MOTHER2')) theme = 'MOTHER2風';
                else if (content.includes('rs3-modal') || content.includes('RS3')) theme = 'ロマサガ風';
                else if (content.includes('Chocolate')) theme = 'チョコレート風';
            }
            
            return { id: dir, title, theme };
        });

    console.log(`Found ${portfolios.length} portfolios:`, portfolios.map(p => p.id));

    // 2. Update save/nox/index.html (Save Data List)
    if (fs.existsSync(NOX_INDEX)) {
        let noxContent = fs.readFileSync(NOX_INDEX, 'utf-8');
        
        const listStart = '<!-- 実績が増えたらここに追加 -->';
        const listEnd = '<div class="p-4 border border-white/10 rounded opacity-40 italic text-center text-sm">';
        
        let newHtml = listStart + '\n';
        portfolios.forEach((p, index) => {
            const no = (index + 1).toString().padStart(3, '0');
            newHtml += `                        <div class="p-3 border border-white/20 rounded hover:bg-white/10 transition-colors cursor-pointer" onclick="location.href='../${p.id}/'">
                            <p class="text-sm opacity-60">no. ${no}</p>
                            <p class="text-xl font-bold">${p.title}</p>
                            <p class="text-xs mt-1">${p.theme}</p>
                        </div>\n`;
        });

        const regex = new RegExp(`${listStart}[\\s\\S]*?${listEnd}`, 'm');
        noxContent = noxContent.replace(regex, newHtml + '                        ' + listEnd);
        
        fs.writeFileSync(NOX_INDEX, noxContent);
        console.log('Updated save/nox/index.html');
    }

    console.log('Sync complete.');
}

sync();
