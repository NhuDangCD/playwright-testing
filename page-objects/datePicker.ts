import { Page, Locator } from '@playwright/test';

export class DatePicker {
    private readonly page: Page;
    private readonly calendarInputField: Locator;

    constructor(page: Page) {
        this.page = page;
        this.calendarInputField = page.getByPlaceholder('Form Picker');
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

        const dayLocator = this.page
            .locator('nb-calendar-day-cell')
            .getByText(targetDay, { exact: true });

        await dayLocator.click();
    }

}
