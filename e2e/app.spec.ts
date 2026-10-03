import { test, expect } from '@playwright/test';

test.describe('瑞文智商测试 E2E', () => {
  test('首页加载正确', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('瑞文标准推理测验');
    await expect(page.locator('#age-input')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('开始测验');
  });

  test('空年龄提交显示错误', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('button[type="submit"]');
    await expect(page.locator('.color-incorrect')).toBeVisible({ timeout: 5000 });
  });

  test('输入有效年龄跳转到测验页', async ({ page }) => {
    await page.goto('/');
    await page.fill('#age-input', '25');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/test');
    await expect(page.locator('.question-card')).toBeVisible();
  });

  test('测验页面显示矩阵和选项', async ({ page }) => {
    await page.goto('/');
    await page.fill('#age-input', '25');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/test');
    const cells = page.locator('.question-card__matrix-cell');
    await expect(cells).toHaveCount(9);
    const options = page.locator('.option-item');
    await expect(options.first()).toBeVisible();
  });

  test('选择答案后自动跳转下一题', async ({ page }) => {
    await page.goto('/');
    await page.fill('#age-input', '25');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/test');
    await page.locator('.option-item').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.text-sm.color-secondary')).toContainText('2 / 72');
  });

  test('导航到历史页面', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/history"]');
    await page.waitForURL('**/history');
    await expect(page.locator('.empty-state__text')).toContainText('暂无历史记录');
  });

  test('导航到结果页面（空状态）', async ({ page }) => {
    await page.goto('/result');
    await expect(page.locator('.empty-state__text')).toContainText('暂无测试结果');
  });

  test('404页面正确显示', async ({ page }) => {
    await page.goto('/nonexistent');
    await expect(page.locator('.empty-state__text')).toContainText('页面不存在');
  });

  test('顶部导航有4个链接', async ({ page }) => {
    await page.goto('/');
    const navLinks = page.locator('.nav-link');
    await expect(navLinks).toHaveCount(4);
  });

  test('底部导航有4个项', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('.bottom-nav__item');
    await expect(items).toHaveCount(4);
  });

  test('主题CSS变量已设置', async ({ page }) => {
    await page.goto('/');
    const primary = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--color-primary')
    );
    expect(primary).toBe('#1a73e8');
  });

  test('响应式：桌面布局', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.locator('.layout--desktop')).toBeVisible();
  });

  test('响应式：移动布局', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('.layout--mobile')).toBeVisible();
  });
});
