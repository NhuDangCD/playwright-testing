import { Page, Locator } from '@playwright/test';
import { HelperBase } from './helperBase';

export class DatePicker extends HelperBase {
    protected readonly page: Page;
    
    // Private locators for date picker
    private readonly calendarInputField: Locator;
    private readonly calendarContainer: Locator;
    private readonly dayCell: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        
        // Initialize date picker locators
        this.calendarInputField = page.getByPlaceholder('Form Picker');
        this.calendarContainer = page.locator('nb-calendar');
        this.dayCell = page.locator('nb-calendar-day-cell');
    }

    async openCalendar() {
        await this.calendarInputField.click();
    }

    async selectCorrectDay(day?: string | number) {
        let targetDay: string;

        if (day === undefined) {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            targetDay = date.getDate().toString();
        } else {
            targetDay = day.toString();
        }

        const dayLocator = this.dayCell.getByText(targetDay, { exact: true });
        await dayLocator.click();
        await this.waitForNumberOfSeconds(0.5);
    }

}
