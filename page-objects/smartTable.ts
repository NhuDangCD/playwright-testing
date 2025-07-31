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
  private readonly tableRows: Locator;

  constructor(page: Page) {
    this.page = page;
    // Dùng XPath để lấy tất cả dòng
    this.tableRows = page.locator('//table//tbody//tr');
  }

  public async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  public async getRowTexts(): Promise<string[]> {
    const rows: string[] = [];

    try {
      await this.tableRows.first().waitFor({ state: 'visible', timeout: 5000 });

      const rowCount = await this.getRowCount();

      if (rowCount === 0) {
        console.warn('Bảng hiện tại không có dòng dữ liệu nào.');
        return [];
      }

      for (let i = 0; i < rowCount; i++) {
        const rowText = await this.tableRows.nth(i).innerText();
        rows.push(rowText.trim());
      }

      return rows;

    } catch (error) {
      console.error('Không thể lấy dữ liệu bảng.', error);
      return [];
    }
  }

  public async getRowObjects(): Promise<RowData[]> {
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
      console.error('Không thể chuyển bảng thành object.', error);
      return [];
    }
  }
}
