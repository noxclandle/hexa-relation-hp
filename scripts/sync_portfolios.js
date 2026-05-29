const fs = require('fs');
const path = require('path');

const SAVE_DIR = path.join(__dirname, '../save');
const NOX_INDEX = path.join(SAVE_DIR, 'nox/index.html');
const ADMIN_INDEX = path.join(__dirname, '../admin/index.html');

// 隠しページリスト（URLは有効だがインデックスには表示されない）
const HIDDEN_IDS = ['retro-rpg', 'cyber-tech', 'visual-novel'];

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
            if (fs.existsSync(indexPath)) {
                let content = fs.readFileSync(indexPath, 'utf-8');
                let name = dir.toUpperCase();
                let theme = 'Unknown Style';
                
                if (content.includes('ファイナルファンタジー') || content.includes('FF14')) theme = 'ファイナルファンタジー風';
                else if (content.includes('MOTHER2')) theme = 'MOTHER2風';
                else if (content.includes('rs3-modal') || content.includes('RS3') || content.includes('ロマサガ')) theme = 'ロマサガ風';
                else if (content.includes('クロノトリガー') || content.includes('CHRONO TRIGGER')) theme = 'クロノトリガー風';
                else if (content.includes('Chocolate')) theme = 'チョコレート風';
                else if (content.includes('DBD')) theme = 'DBD風';

                const newTitle = `${name} - Portfolio (${theme})`;
                const titleRegex = /<title>.*?<\/title>/;
                const updatedContent = content.replace(titleRegex, `<title>${newTitle}</title>`);
                
                if (content !== updatedContent) {
                    fs.writeFileSync(indexPath, updatedContent);
                    console.log(`Updated title for ${dir}: ${newTitle}`);
                }
                
                return { id: dir, title: name, theme, hidden: HIDDEN_IDS.includes(dir) };
            }
        });

    const visiblePortfolios = portfolios.filter(p => !p.hidden);
    console.log(`Found ${portfolios.length} portfolios (${visiblePortfolios.length} visible):`, portfolios.map(p => p.id));

    // 2. Update admin/index.html (Inject ALL_PAGE_IDS & MARKETING_PAGE_IDS)
    if (fs.existsSync(ADMIN_INDEX)) {
        let adminContent = fs.readFileSync(ADMIN_INDEX, 'utf-8');
        
        // Portfolios (Save Data)
        const allIds = ['nox', ...portfolios.map(p => p.id)];
        const idList = allIds.map(id => `'${id}'`).join(', ');
        
        // Marketing LPs (Intro)
        const INTRO_DIR = path.join(__dirname, '../intro');
        const marketingLPs = fs.readdirSync(INTRO_DIR)
            .filter(dir => fs.statSync(path.join(INTRO_DIR, dir)).isDirectory())
            .map(dir => {
                const indexPath = path.join(INTRO_DIR, dir, 'index.html');
                let name = dir.toUpperCase();
                let desc = 'No description';
                if (fs.existsSync(indexPath)) {
                    const content = fs.readFileSync(indexPath, 'utf-8');
                    const titleMatch = content.match(/<title>(.*?)<\/title>/);
                    if (titleMatch) name = titleMatch[1].split('|')[0].trim();
                    const descMatch = content.match(/<meta name="description" content="(.*?)"/);
                    if (descMatch) desc = descMatch[1];
                }
                return { id: dir, name, desc };
            });
        const marketingList = JSON.stringify(marketingLPs);

        const injectStart = '// AUTO_INJECT_START';
        const injectEnd = '// AUTO_INJECT_END';
        const regex = new RegExp(`${injectStart}[\\s\\S]*?${injectEnd}`, 'm');
        
        const injection = `${injectStart}
        const ALL_PAGE_IDS = [${idList}];
        const MARKETING_PAGES = ${marketingList};
        ${injectEnd}`;

        adminContent = adminContent.replace(regex, injection);
        fs.writeFileSync(ADMIN_INDEX, adminContent);
        console.log('Updated admin/index.html with both Portfolio and Marketing IDs');
    }

    // 3. Update save/nox/index.html (Only visible portfolios)
    if (fs.existsSync(NOX_INDEX)) {
        let noxContent = fs.readFileSync(NOX_INDEX, 'utf-8');
        const listStart = '<!-- 実績が増えたらここに追加 -->';
        const listEnd = '<div id="list-end-marker"';
        
        let newHtml = listStart + '\n';
        visiblePortfolios.forEach((p, index) => {
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
        console.log('Updated save/nox/index.html (Pagination support preserved)');
    }

    console.log('Sync complete.');

    // 4. Generate sitemap.xml
    generateSitemap(visiblePortfolios);
}

function generateSitemap(visiblePortfolios) {
    console.log('Generating sitemap.xml...');
    const baseUrl = 'https://hexa-relation.com';
    const today = new Date().toISOString().split('T')[0];
    const INTRO_DIR = path.join(__dirname, '../intro');

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${today}</lastmod>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/save/nox/</loc>
        <lastmod>${today}</lastmod>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${baseUrl}/intro/</loc>
        <lastmod>${today}</lastmod>
        <priority>0.9</priority>
    </url>`;

    // Add niche LPs from /intro/
    if (fs.existsSync(INTRO_DIR)) {
        const niches = fs.readdirSync(INTRO_DIR).filter(dir => fs.statSync(path.join(INTRO_DIR, dir)).isDirectory());
        niches.forEach(n => {
            sitemap += `
    <url>
        <loc>${baseUrl}/intro/${n}/</loc>
        <lastmod>${today}</lastmod>
        <priority>0.9</priority>
    </url>`;
        });
    }

    visiblePortfolios.forEach(p => {
        sitemap += `
    <url>
        <loc>${baseUrl}/save/${p.id}/</loc>
        <lastmod>${today}</lastmod>
        <priority>0.7</priority>
    </url>`;
    });

    sitemap += `
</urlset>`;

    fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), sitemap);
    console.log('sitemap.xml generated successfully.');
}

sync();
