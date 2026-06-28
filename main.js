var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => WeeklyCreatorPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  templatePath: "2026/module/WeekModule.md",
  outputPath: ""
};
var WeeklyCreatorPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.addRibbonIcon("calendar-range", "Weekly Creator", () => {
      new WeeklyCreatorModal(this.app, this).open();
    });
    this.addCommand({
      id: "open-weekly-creator",
      name: "\u6279\u91CF\u521B\u5EFA\u5468\u8BB0\u6587\u4EF6",
      callback: () => new WeeklyCreatorModal(this.app, this).open()
    });
    this.addSettingTab(new WeeklyCreatorSettingTab(this.app, this));
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var WeeklyCreatorModal = class extends import_obsidian.Modal {
  constructor(app, plugin) {
    super(app);
    this.startDateStr = "";
    this.weeksStr = "4";
    this.plugin = plugin;
    this.templatePath = plugin.settings.templatePath;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "\u521B\u5EFA\u5468\u8BB0\u6587\u4EF6" });
    new import_obsidian.Setting(contentEl).setName("\u5F00\u59CB\u65E5\u671F").setDesc("\u652F\u6301 YYYY-MM-DD / YYYY/MM/DD / YYYYMMDD").addText(
      (t) => t.setPlaceholder("2026-06-30").onChange((v) => this.startDateStr = v.trim())
    );
    new import_obsidian.Setting(contentEl).setName("\u521B\u5EFA\u5468\u6570").addText(
      (t) => t.setValue("4").onChange((v) => this.weeksStr = v.trim())
    );
    new import_obsidian.Setting(contentEl).setName("\u6A21\u677F\u8DEF\u5F84").setDesc("\u76F8\u5BF9\u4E8E vault \u6839\u76EE\u5F55").addText(
      (t) => t.setValue(this.templatePath).onChange((v) => this.templatePath = v.trim())
    );
    new import_obsidian.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("\u521B\u5EFA").setCta().onClick(() => this.run())
    );
  }
  onClose() {
    this.contentEl.empty();
  }
  async run() {
    const startDate = parseDate(this.startDateStr);
    if (!startDate) {
      new import_obsidian.Notice("\u274C \u65E5\u671F\u683C\u5F0F\u9519\u8BEF");
      return;
    }
    const weeks = parseInt(this.weeksStr);
    if (isNaN(weeks) || weeks <= 0) {
      new import_obsidian.Notice("\u274C \u5468\u6570\u5FC5\u987B\u662F\u6B63\u6574\u6570");
      return;
    }
    const templateFile = this.app.vault.getAbstractFileByPath(
      (0, import_obsidian.normalizePath)(this.templatePath)
    );
    if (!(templateFile instanceof import_obsidian.TFile)) {
      new import_obsidian.Notice(`\u274C \u6A21\u677F\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A${this.templatePath}`);
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
      const filePath = (0, import_obsidian.normalizePath)(outputDir ? `${outputDir}/${filename}` : filename);
      if (await this.app.vault.adapter.exists(filePath)) {
        skipped++;
        continue;
      }
      const content = template.replace(/\{week_start\}/g, s).replace(/\{week_end\}/g, e);
      await this.app.vault.create(filePath, content);
      created++;
    }
    new import_obsidian.Notice(`\u2705 \u521B\u5EFA ${created} \u4E2A\uFF0C\u8DF3\u8FC7 ${skipped} \u4E2A\u5DF2\u5B58\u5728\u6587\u4EF6`);
    this.close();
  }
};
var WeeklyCreatorSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Weekly Creator" });
    new import_obsidian.Setting(containerEl).setName("\u9ED8\u8BA4\u6A21\u677F\u8DEF\u5F84").setDesc("\u76F8\u5BF9\u4E8E vault \u6839\u76EE\u5F55\uFF0C\u4F8B\u5982 2026/module/WeekModule.md").addText(
      (t) => t.setValue(this.plugin.settings.templatePath).onChange(async (v) => {
        this.plugin.settings.templatePath = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\u5468\u8BB0\u8F93\u51FA\u76EE\u5F55").setDesc("\u7559\u7A7A\u5219\u4FDD\u5B58\u5230 vault \u6839\u76EE\u5F55").addText(
      (t) => t.setValue(this.plugin.settings.outputPath).onChange(async (v) => {
        this.plugin.settings.outputPath = v;
        await this.plugin.saveSettings();
      })
    );
  }
};
function parseDate(str) {
  const patterns = [
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
    /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/,
    /^(\d{4})(\d{2})(\d{2})$/
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
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
