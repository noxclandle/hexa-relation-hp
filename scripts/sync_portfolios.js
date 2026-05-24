const fs = require('fs');
const path = require('path');

const SAVE_DIR = path.join(__dirname, '../save');
const NOX_INDEX = path.join(SAVE_DIR, 'nox/index.html');
const ADMIN_INDEX = path.join(__dirname, '../admin/index.html');

function sync() {
    console.log('Starting portfolio sync...');

    // 1. Scan save directory and sort by creation time
    const portfolios = fs.readdirSync(SAVE_DIR)
        .filter(dir => dir !== 'nox' && fs.statSync(path.join(SAVE_DIR, dir)).isDirectory())
        .sort((a, b) => {
            return fs.statSync(path.join(SAVE_DIR, a)).birthtimeMs - fs.statSync(path.join(SAVE_DIR, b)).birthtimeMs;
        })
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
                if (content.includes('ファイナルファンタジー') || content.includes('FF14')) theme = 'ファイナルファンタジー風';
                else if (content.includes('MOTHER2')) theme = 'MOTHER2風';
                else if (content.includes('rs3-modal') || content.includes('RS3') || content.includes('ロマサガ')) theme = 'ロマサガ風';
                else if (content.includes('Chocolate')) theme = 'チョコレート風';
            }
            
            return { id: dir, title, theme };
        });

    console.log(`Found ${portfolios.length} portfolios:`, portfolios.map(p => p.id));

    // 2. Update admin/index.html (Inject ALL_PAGE_IDS)
    if (fs.existsSync(ADMIN_INDEX)) {
        let adminContent = fs.readFileSync(ADMIN_INDEX, 'utf-8');
        
        const injectStart = '// AUTO_INJECT_START';
        const injectEnd = '// AUTO_INJECT_END';
        
        const idList = portfolios.map(p => `'${p.id}'`).join(', ');
        const injectHtml = `${injectStart}\n        const ALL_PAGE_IDS = [${idList}];\n        ${injectEnd}`;

        const regex = new RegExp(`${injectStart}[\\s\\S]*?${injectEnd}`, 'm');
        adminContent = adminContent.replace(regex, injectHtml);
        
        fs.writeFileSync(ADMIN_INDEX, adminContent);
        console.log('Updated admin/index.html with ALL_PAGE_IDS');
    }

    // 3. Update save/nox/index.html (Save Data List)
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
