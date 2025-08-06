import { Locator, Page } from '@playwright/test';
import { HelperBase } from './helperBase';

export class FormLayoutsPage extends HelperBase {
    protected readonly page: Page;

    // Private locators for Using the Grid form
    private readonly usingGridContainer: Locator;
    private readonly gridEmailField: Locator;
    private readonly gridPasswordField: Locator;
    private readonly gridOption1Radio: Locator;
    private readonly gridOption2Radio: Locator;
    private readonly gridSubmitButton: Locator;

    // Private locators for Inline form
    private readonly inlineFormContainer: Locator;
    private readonly inlineNameField: Locator;
    private readonly inlineEmailField: Locator;
    private readonly inlineRememberCheckbox: Locator;
    private readonly inlineSubmitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        
        // Initialize Using the Grid form locators
        this.usingGridContainer = page.locator('nb-card', { hasText: "Using the Grid" });
        this.gridEmailField = this.usingGridContainer.getByLabel('Email');
        this.gridPasswordField = this.usingGridContainer.getByRole('textbox', { name: 'Password' });
        this.gridOption1Radio = this.usingGridContainer.getByRole('radio', { name: 'Option 1' });
        this.gridOption2Radio = this.usingGridContainer.getByRole('radio', { name: 'Option 2' });
        this.gridSubmitButton = this.usingGridContainer.getByRole('button');

        // Initialize Inline form locators
        this.inlineFormContainer = page.locator('nb-card', { hasText: "Inline form" });
        this.inlineNameField = this.inlineFormContainer.getByRole('textbox', { name: 'Jane Doe' });
        this.inlineEmailField = this.inlineFormContainer.getByRole('textbox', { name: 'Email' });
        this.inlineRememberCheckbox = this.inlineFormContainer.getByRole('checkbox');
        this.inlineSubmitButton = this.inlineFormContainer.getByRole('button');
    }
    async submitFormWithCredentials(email: string, password: string, optionalText: string) {
        await this.gridEmailField.fill(email);
        await this.gridPasswordField.fill(password);
        
        // Select the appropriate radio option
        if (optionalText === 'Option 1') {
            await this.gridOption1Radio.check({ force: true });
        } else if (optionalText === 'Option 2') {
            await this.gridOption2Radio.check({ force: true });
        }
        
        await this.gridSubmitButton.click();
    }
    async submitInlineFormsWithEmailAndCheckbox(name: string, email: string, rememberMe: boolean) {
        await this.inlineNameField.fill(name);
        await this.inlineEmailField.fill(email);
        
        if (rememberMe) {
            await this.inlineRememberCheckbox.check({ force: true });
        }
        
        await this.inlineSubmitButton.click();
    }

}