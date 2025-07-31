import { Page } from "@playwright/test";

export class HelperBase {
    protected readonly page: Page;
    constructor(page: Page) {
        this.page = page
        //this.baseUrl = "http://localhost:4200/"
    }
    public async waitForNumberOfSeconds(timeInSecond: number) {
        await this.page.waitForTimeout(timeInSecond * 1000)
    }
}