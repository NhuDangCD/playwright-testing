import { Locator, Page } from '@playwright/test';

interface RowData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  age: string;
}

export class SmartTablePage {
  private readonly page: Page;
  
  // Private locators for smart table elements
  private readonly table: Locator;
  private readonly tableBody: Locator;
  private readonly tableRows: Locator;
  private readonly tableHeader: Locator;
  private readonly searchInput: Locator;
  private readonly addNewButton: Locator;

  private constructor(page: Page) {
    this.page = page;
    
    // Initialize smart table locators using XPath
    this.table = page.locator('//table');
    this.tableBody = page.locator('//table//tbody');
    this.tableRows = page.locator('//table//tbody//tr');
    this.tableHeader = page.locator('//table//thead//tr');
    this.searchInput = page.locator('//input[@placeholder="Search"]');
    this.addNewButton = page.locator('//button[contains(text(),"Add New")]');
  }

  static create(page: Page): SmartTablePage {
    return new SmartTablePage(page);
  }

  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async getRowTexts(): Promise<string[]> {
    const rows: string[] = [];

    try {
      await this.tableRows.first().waitFor({ state: 'visible', timeout: 5000 });

      const rowCount = await this.getRowCount();

      if (rowCount === 0) {
        console.warn('Table currently has no data rows.');
        return [];
      }

      for (let i = 0; i < rowCount; i++) {
        const rowText = await this.tableRows.nth(i).innerText();
        rows.push(rowText.trim());
      }

      return rows;

    } catch (error) {
      console.error('Unable to retrieve table data.', error);
      return [];
    }
  }

  async getRowObjects(): Promise<RowData[]> {
    const rowObjects: RowData[] = [];

    try {
      await this.tableRows.first().waitFor({ state: 'visible', timeout: 5000 });

      const rowCount = await this.tableRows.count();

      for (let i = 0; i < rowCount; i++) {
        const row = this.tableRows.nth(i);
        const cells = row.locator('td');

        const id = (await cells.nth(1).innerText()).trim();
        const firstName = (await cells.nth(2).innerText()).trim();
        const lastName = (await cells.nth(3).innerText()).trim();
        const username = (await cells.nth(4).innerText()).trim();
        const email = (await cells.nth(5).innerText()).trim();
        const age = (await cells.nth(6).innerText()).trim();

        rowObjects.push({ id, firstName, lastName, username, email, age });
      }

      return rowObjects;

    } catch (error) {
      console.error('Unable to convert table to objects.', error);
      return [];
    }
  }
}
