import {
    App,
    Modal,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
    TFile,
    normalizePath,
} from 'obsidian';

interface WeeklyCreatorSettings {
    templatePath: string;
    outputPath: string;
}

const DEFAULT_SETTINGS: WeeklyCreatorSettings = {
    templatePath: '2026/module/WeekModule.md',
    outputPath: '',
};

export default class WeeklyCreatorPlugin extends Plugin {
    settings: WeeklyCreatorSettings;

    async onload() {
        await this.loadSettings();

        this.addRibbonIcon('calendar-range', 'Weekly Creator', () => {
            new WeeklyCreatorModal(this.app, this).open();
        });

        this.addCommand({
            id: 'open-weekly-creator',
            name: '批量创建周记文件',
            callback: () => new WeeklyCreatorModal(this.app, this).open(),
        });

        this.addSettingTab(new WeeklyCreatorSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

// ─── Modal ────────────────────────────────────────────────────────────────────

class WeeklyCreatorModal extends Modal {
    private plugin: WeeklyCreatorPlugin;
    private startDateStr = '';
    private weeksStr = '4';
    private templatePath: string;

    constructor(app: App, plugin: WeeklyCreatorPlugin) {
        super(app);
        this.plugin = plugin;
        this.templatePath = plugin.settings.templatePath;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: '创建周记文件' });

        new Setting(contentEl)
            .setName('开始日期')
            .setDesc('支持 YYYY-MM-DD / YYYY/MM/DD / YYYYMMDD')
            .addText(t =>
                t.setPlaceholder('2026-06-30')
                    .onChange(v => (this.startDateStr = v.trim()))
            );

        new Setting(contentEl)
            .setName('创建周数')
            .addText(t =>
                t.setValue('4')
                    .onChange(v => (this.weeksStr = v.trim()))
            );

        new Setting(contentEl)
            .setName('模板路径')
            .setDesc('相对于 vault 根目录')
            .addText(t =>
                t.setValue(this.templatePath)
                    .onChange(v => (this.templatePath = v.trim()))
            );

        new Setting(contentEl).addButton(btn =>
            btn.setButtonText('创建').setCta().onClick(() => this.run())
        );
    }

    onClose() {
        this.contentEl.empty();
    }

    private async run() {
        const startDate = parseDate(this.startDateStr);
        if (!startDate) {
            new Notice('❌ 日期格式错误');
            return;
        }

        const weeks = parseInt(this.weeksStr);
        if (isNaN(weeks) || weeks <= 0) {
            new Notice('❌ 周数必须是正整数');
            return;
        }

        const templateFile = this.app.vault.getAbstractFileByPath(
            normalizePath(this.templatePath)
        );
        if (!(templateFile instanceof TFile)) {
            new Notice(`❌ 模板文件不存在：${this.templatePath}`);
            return;
        }

        const template = await this.app.vault.read(templateFile);
        const outputDir = this.plugin.settings.outputPath;

        let created = 0;
        let skipped = 0;

        for (let i = 0; i < weeks; i++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(weekStart.getDate() + i * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            const s = formatDate(weekStart);
            const e = formatDate(weekEnd);
            const filename = `${s}--${e}.md`;
            const filePath = normalizePath(outputDir ? `${outputDir}/${filename}` : filename);

            if (await this.app.vault.adapter.exists(filePath)) {
                skipped++;
                continue;
            }

            const content = template
                .replace(/\{week_start\}/g, s)
                .replace(/\{week_end\}/g, e);

            await this.app.vault.create(filePath, content);
            created++;
        }

        new Notice(`✅ 创建 ${created} 个，跳过 ${skipped} 个已存在文件`);
        this.close();
    }
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

class WeeklyCreatorSettingTab extends PluginSettingTab {
    private plugin: WeeklyCreatorPlugin;

    constructor(app: App, plugin: WeeklyCreatorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Weekly Creator' });

        new Setting(containerEl)
            .setName('默认模板路径')
            .setDesc('相对于 vault 根目录，例如 2026/module/WeekModule.md')
            .addText(t =>
                t.setValue(this.plugin.settings.templatePath)
                    .onChange(async v => {
                        this.plugin.settings.templatePath = v;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('周记输出目录')
            .setDesc('留空则保存到 vault 根目录')
            .addText(t =>
                t.setValue(this.plugin.settings.outputPath)
                    .onChange(async v => {
                        this.plugin.settings.outputPath = v;
                        await this.plugin.saveSettings();
                    })
            );
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(str: string): Date | null {
    const patterns = [
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
        /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
        /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/,
        /^(\d{4})(\d{2})(\d{2})$/,
    ];
    for (const re of patterns) {
        const m = str.match(re);
        if (m) {
            const d = new Date(+m[1], +m[2] - 1, +m[3]);
            if (!isNaN(d.getTime())) return d;
        }
    }
    return null;
}

function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
