const fs = require('fs');
const path = require('path');

const SAVE_DIR = path.join(__dirname, '../save');
const NOX_INDEX = path.join(SAVE_DIR, 'nox/index.html');
const ADMIN_INDEX = path.join(__dirname, '../admin/index.html');

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
                    title = titleMatch[1].split(' - ')[0]; // Extract "TEN" from "TEN - Portfolio..."
                }
                
                // Try to guess theme from title or content
                if (content.includes('FF14')) theme = 'FF14風';
                else if (content.includes('MOTHER2')) theme = 'MOTHER2風';
                else if (content.includes('Romancing')) theme = 'ロマサガ風';
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

        // Use regex to replace content between listStart and listEnd
        const regex = new RegExp(`${listStart}[\\s\\S]*?${listEnd}`, 'm');
        noxContent = noxContent.replace(regex, newHtml + '                        ' + listEnd);
        
        fs.writeFileSync(NOX_INDEX, noxContent);
        console.log('Updated save/nox/index.html');
    }

    // 3. Update admin/index.html (Add Link List section)
    if (fs.existsSync(ADMIN_INDEX)) {
        let adminContent = fs.readFileSync(ADMIN_INDEX, 'utf-8');
        
        const adminSectionStart = '<!-- AUTO_PORTFOLIO_LIST_START -->';
        const adminSectionEnd = '<!-- AUTO_PORTFOLIO_LIST_END -->';
        
        let adminHtml = adminSectionStart + '\n';
        adminHtml += '            <div class="mt-8">\n';
        adminHtml += '                <h2 class="text-xl mb-4">▶ ポートフォリオ一覧</h2>\n';
        adminHtml += '                <div class="grid grid-cols-2 gap-4">\n';
        portfolios.forEach(p => {
            adminHtml += `                    <a href="../save/${p.id}/" target="_blank" class="border border-green-500 p-4 hover:bg-green-900 transition-colors">\n`;
            adminHtml += `                        <div class="text-lg font-bold">${p.title}</div>\n`;
            adminHtml += `                        <div class="text-xs opacity-60">ID: ${p.id} / ${p.theme}</div>\n`;
            adminHtml += '                    </a>\n';
        });
        adminHtml += '                </div>\n';
        adminHtml += '            </div>\n';
        adminHtml += adminSectionEnd;

        if (adminContent.includes(adminSectionStart)) {
            const regex = new RegExp(`${adminSectionStart}[\\s\\S]*?${adminSectionEnd}`, 'm');
            adminContent = adminContent.replace(regex, adminHtml);
        } else {
            // Insert before </table> or end of debug-window
            adminContent = adminContent.replace('</table>', '</table>\n' + adminHtml);
        }
        
        fs.writeFileSync(ADMIN_INDEX, adminContent);
        console.log('Updated admin/index.html');
    }

    console.log('Sync complete.');
}

sync();
