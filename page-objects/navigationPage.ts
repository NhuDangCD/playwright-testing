import { Locator, Page } from "@playwright/test";
import { HelperBase } from "./helperBase";

export class NavigationPage extends HelperBase {
    protected readonly page: Page;


    // Private locators 
    private readonly fromLayoutsMenuItem: Locator;
    private readonly datePickerMenuItem: Locator;
    private readonly smartTableMenuItem: Locator;
    private readonly toastrMenuItem: Locator;
    private readonly tooltipMenuItem: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        // Initialize locators here using Xpath
        this.fromLayoutsMenuItem = page.locator('//a[normalize-space()="Form Layouts"]');
        this.datePickerMenuItem = page.locator('//a[normalize-space()="Datepicker"]');
        this.smartTableMenuItem = page.locator('//a[normalize-space()="Smart Table"]');
        this.toastrMenuItem = page.locator('//a[normalize-space()="Toastr"]');
        this.tooltipMenuItem = page.locator('//a[normalize-space()="Tooltip"]');
    }

    async formLayoutsPage() {
        await this.selectgroupMenuItem("Forms");
        await this.fromLayoutsMenuItem.click();
        await this.waitForNumberOfSeconds(2);
    }

    async datepickerPage() {
        await this.selectgroupMenuItem("Forms");
        await this.datePickerMenuItem.click();
    }

    async smartTablePage() {
        await this.selectgroupMenuItem("Tables & Data");
        await this.smartTableMenuItem.click();
    }

    async toastrPage() {
        await this.selectgroupMenuItem("Modal & Overlays");
        await this.toastrMenuItem.click();
    }

    async tooltipPage() {
        await this.selectgroupMenuItem("Modal & Overlays");
        await this.tooltipMenuItem.click();
    }

    async selectgroupMenuItem(groupItemTitle: string) {
        const menuItem = this.page.locator(`a[title="${groupItemTitle}"]`);
        const expandedState = await menuItem.getAttribute("aria-expanded");
        if (expandedState === "false") {
            await menuItem.click();
        }
    }
}


