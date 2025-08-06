import { Locator, Page } from "@playwright/test";
import { HelperBase } from "./helperBase";

export class ToasterPage extends HelperBase {
    protected readonly page: Page;

    // Private locators for toaster configuration
    private readonly positionSelect: Locator;
    private readonly titleInput: Locator;
    private readonly contentInput: Locator;
    private readonly timeoutInput: Locator;
    private readonly toastTypeSelect: Locator;
    private readonly preventDuplicatesCheckbox: Locator;
    private readonly hideOnClickCheckbox: Locator;

    // Toast type buttons
    private readonly showToastButton: Locator;
    private readonly successButton: Locator;
    private readonly infoButton: Locator;
    private readonly warningButton: Locator;
    private readonly primaryButton: Locator;
    private readonly dangerButton: Locator;

    // Clear buttons
    private readonly clearToastsButton: Locator;
    private readonly clearLastToastButton: Locator;

    // Toaster elements
    private readonly toasterContainer: Locator;
    private readonly toastElements: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        
        // Initialize configuration locators
        this.positionSelect = page.locator('select[ng-reflect-model="top-right"]').or(page.locator('nb-select[placeholder="Position"]'));
        this.titleInput = page.locator('input[placeholder="Title"]');
        this.contentInput = page.locator('input[placeholder="Content"]');
        this.timeoutInput = page.locator('input[placeholder="Timeout"]');
        this.toastTypeSelect = page.locator('nb-select[placeholder="Toast type"]').or(page.locator('select[ng-reflect-model="success"]'));
        this.preventDuplicatesCheckbox = page.locator('nb-checkbox:has-text("Prevent arising of duplicate toast")').or(page.locator('input[type="checkbox"]').first());
        this.hideOnClickCheckbox = page.locator('nb-checkbox:has-text("Hide on click")').or(page.locator('input[type="checkbox"]').nth(1));

        // Initialize toast buttons
        this.showToastButton = page.locator('button:has-text("Show toast")');
        this.successButton = page.locator('button').filter({ hasText: /^Success$/ });
        this.infoButton = page.locator('button').filter({ hasText: /^Info$/ });
        this.warningButton = page.locator('button').filter({ hasText: /^Warning$/ });
        this.primaryButton = page.locator('button').filter({ hasText: /^Primary$/ });
        this.dangerButton = page.locator('button').filter({ hasText: /^Danger$/ });

        // Initialize clear buttons
        this.clearToastsButton = page.locator('button:has-text("Clear all toasts")');
        this.clearLastToastButton = page.locator('button:has-text("Clear last toast")');

        // Initialize toaster elements
        this.toasterContainer = page.locator('nb-toastr-container').or(page.locator('.toastr-container'));
        this.toastElements = page.locator('nb-toast').or(page.locator('.toast'));
    }

    // Configuration methods
    async selectPosition(position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center') {
        await this.positionSelect.click();
        await this.page.locator(`nb-option[ng-reflect-value="${position}"]`).or(this.page.locator(`option[value="${position}"]`)).click();
    }

    async setTitle(title: string) {
        await this.titleInput.clear();
        await this.titleInput.fill(title);
    }

    async setContent(content: string) {
        await this.contentInput.clear();
        await this.contentInput.fill(content);
    }

    async setTimeout(timeout: number) {
        await this.timeoutInput.clear();
        await this.timeoutInput.fill(timeout.toString());
    }

    async selectToastType(type: 'success' | 'info' | 'warning' | 'primary' | 'danger') {
        await this.toastTypeSelect.click();
        await this.page.locator(`nb-option[ng-reflect-value="${type}"]`).or(this.page.locator(`option[value="${type}"]`)).click();
    }

    async togglePreventDuplicates(enable: boolean = true) {
        const isChecked = await this.preventDuplicatesCheckbox.isChecked();
        if (isChecked !== enable) {
            await this.preventDuplicatesCheckbox.click();
        }
    }

    async toggleHideOnClick(enable: boolean = true) {
        const isChecked = await this.hideOnClickCheckbox.isChecked();
        if (isChecked !== enable) {
            await this.hideOnClickCheckbox.click();
        }
    }

    // Toast action methods
    async showToast() {
        await this.showToastButton.click();
    }

    async showSuccessToast() {
        await this.successButton.click();
    }

    async showInfoToast() {
        await this.infoButton.click();
    }

    async showWarningToast() {
        await this.warningButton.click();
    }

    async showPrimaryToast() {
        await this.primaryButton.click();
    }

    async showDangerToast() {
        await this.dangerButton.click();
    }

    async clearAllToasts() {
        await this.clearToastsButton.click();
    }

    async clearLastToast() {
        await this.clearLastToastButton.click();
    }

    // Verification methods
    async getToastCount(): Promise<number> {
        return await this.toastElements.count();
    }

    async getToastText(index: number = 0): Promise<{ title: string; content: string }> {
        const toast = this.toastElements.nth(index);
        await toast.waitFor({ state: 'visible' });
        
        const title = await toast.locator('.toast-title').or(toast.locator('span').first()).textContent() || '';
        const content = await toast.locator('.toast-message').or(toast.locator('div').last()).textContent() || '';
        
        return { title: title.trim(), content: content.trim() };
    }

    async isToastVisible(index: number = 0): Promise<boolean> {
        try {
            await this.toastElements.nth(index).waitFor({ state: 'visible', timeout: 2000 });
            return true;
        } catch {
            return false;
        }
    }

    async waitForToastToDisappear(index: number = 0, timeout: number = 10000): Promise<boolean> {
        try {
            await this.toastElements.nth(index).waitFor({ state: 'hidden', timeout });
            return true;
        } catch {
            return false;
        }
    }

    async getToastPosition(): Promise<string> {
        const container = this.toasterContainer;
        await container.waitFor({ state: 'visible' });
        
        const classes = await container.getAttribute('class') || '';
        
        if (classes.includes('top-right')) return 'top-right';
        if (classes.includes('top-left')) return 'top-left';
        if (classes.includes('bottom-right')) return 'bottom-right';
        if (classes.includes('bottom-left')) return 'bottom-left';
        if (classes.includes('top-center')) return 'top-center';
        if (classes.includes('bottom-center')) return 'bottom-center';
        
        return 'unknown';
    }

    async getToastType(index: number = 0): Promise<string> {
        const toast = this.toastElements.nth(index);
        await toast.waitFor({ state: 'visible' });
        
        const classes = await toast.getAttribute('class') || '';
        
        if (classes.includes('success')) return 'success';
        if (classes.includes('info')) return 'info';
        if (classes.includes('warning')) return 'warning';
        if (classes.includes('primary')) return 'primary';
        if (classes.includes('danger')) return 'danger';
        
        return 'unknown';
    }

    async clickOnToast(index: number = 0) {
        const toast = this.toastElements.nth(index);
        await toast.waitFor({ state: 'visible' });
        await toast.click();
    }

    async waitForToastsToLoad() {
        await this.waitForNumberOfSeconds(1);
    }

    async configureAndShowToast(config: {
        position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
        title?: string;
        content?: string;
        timeout?: number;
        type?: 'success' | 'info' | 'warning' | 'primary' | 'danger';
        preventDuplicates?: boolean;
        hideOnClick?: boolean;
    }) {
        if (config.position) await this.selectPosition(config.position);
        if (config.title) await this.setTitle(config.title);
        if (config.content) await this.setContent(config.content);
        if (config.timeout !== undefined) await this.setTimeout(config.timeout);
        if (config.type) await this.selectToastType(config.type);
        if (config.preventDuplicates !== undefined) await this.togglePreventDuplicates(config.preventDuplicates);
        if (config.hideOnClick !== undefined) await this.toggleHideOnClick(config.hideOnClick);
        
        await this.showToast();
    }
}