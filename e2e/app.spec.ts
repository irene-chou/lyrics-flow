import { test, expect } from '@playwright/test'

test.describe('App loads', () => {
  test('renders header with app title', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText('Lyrics Flow')
  })

  test('renders FAB button', async ({ page }) => {
    await page.goto('/')
    const fab = page.locator('button[title="新增歌曲"]')
    await expect(fab).toBeVisible()
  })

  test('renders header action buttons', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('button[title="切換主題"]')).toBeVisible()
    await expect(page.locator('button[title="歌曲庫"]')).toBeVisible()
    await expect(page.locator('button[title="複製 OBS 瀏覽器來源 URL"]')).toBeVisible()
  })
})

test.describe('Theme toggle', () => {
  test('toggles between dark and light theme', async ({ page }) => {
    await page.goto('/')
    const themeBtn = page.locator('button[title="切換主題"]')

    // Get initial theme class on <html>
    const initialClass = await page.locator('html').getAttribute('class')

    // Click to toggle theme
    await themeBtn.click()
    await page.waitForTimeout(300)

    const newClass = await page.locator('html').getAttribute('class')
    expect(newClass).not.toBe(initialClass)
  })
})

test.describe('Song drawer', () => {
  test('opens song drawer via header button', async ({ page }) => {
    await page.goto('/')
    const drawerBtn = page.locator('button[title="歌曲庫"]')
    await drawerBtn.click()

    // Drawer should show title "歌曲庫"
    await expect(page.getByRole('heading', { name: '歌曲庫' })).toBeVisible()
  })

  test('shows empty state when no songs', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[title="歌曲庫"]').click()

    await expect(page.getByText('尚無歌曲')).toBeVisible()
  })

  test('closes drawer via close button', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[title="歌曲庫"]').click()

    // Wait for drawer to appear
    await expect(page.getByRole('heading', { name: '歌曲庫' })).toBeVisible()

    // Click close button
    await page.locator('button[title="關閉"]').click()

    // Drawer heading should disappear
    await expect(page.getByRole('heading', { name: '歌曲庫' })).not.toBeVisible()
  })
})

test.describe('Song modal', () => {
  test('opens new song modal via FAB', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[title="新增歌曲"]').click()

    // Modal should show "新增歌曲" title
    await expect(page.getByRole('heading', { name: '新增歌曲' })).toBeVisible()
  })

  test('modal has song name input and save button', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[title="新增歌曲"]').click()

    // Song name input
    await expect(page.getByPlaceholder('輸入歌曲名稱')).toBeVisible()

    // Save and cancel buttons
    await expect(page.getByRole('button', { name: '儲存並載入' })).toBeVisible()
    await expect(page.getByRole('button', { name: '取消' })).toBeVisible()
  })

  test('closes modal via cancel button', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[title="新增歌曲"]').click()

    await expect(page.getByRole('heading', { name: '新增歌曲' })).toBeVisible()

    await page.getByRole('button', { name: '取消' }).click()

    await expect(page.getByRole('heading', { name: '新增歌曲' })).not.toBeVisible()
  })

  test('shows alert when saving without LRC', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[title="新增歌曲"]').click()

    // Fill name but leave LRC empty
    await page.getByPlaceholder('輸入歌曲名稱').fill('Test Song')

    // Listen for dialog (alert)
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('LRC')
      await dialog.accept()
    })

    await page.getByRole('button', { name: '儲存並載入' }).click()
  })
})

test.describe('Create and load song', () => {
  test('creates a song with LRC and loads it', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[title="新增歌曲"]').click()

    // Fill song name
    await page.getByPlaceholder('輸入歌曲名稱').fill('E2E Test Song')

    // Fill LRC text — find the textarea for LRC input
    const lrcTextarea = page.locator('textarea').first()
    await lrcTextarea.fill(
      '[00:05.00]First line of lyrics\n[00:10.00]Second line of lyrics\n[00:15.00]Third line',
    )

    // Save
    await page.getByRole('button', { name: '儲存並載入' }).click()

    // Modal should close
    await expect(page.getByRole('heading', { name: '新增歌曲' })).not.toBeVisible()

    // Lyrics should appear on screen
    await expect(page.getByText('First line of lyrics')).toBeVisible()
    await expect(page.getByText('Second line of lyrics')).toBeVisible()
    await expect(page.getByText('Third line')).toBeVisible()
  })

  test('created song appears in song drawer', async ({ page }) => {
    await page.goto('/')

    // Create a song first
    await page.locator('button[title="新增歌曲"]').click()
    await page.getByPlaceholder('輸入歌曲名稱').fill('Drawer Test Song')
    const lrcTextarea = page.locator('textarea').first()
    await lrcTextarea.fill('[00:01.00]Hello')
    await page.getByRole('button', { name: '儲存並載入' }).click()

    // Open drawer
    await page.locator('button[title="歌曲庫"]').click()

    // Song should be listed in the drawer
    await expect(page.getByLabel('歌曲庫').getByText('Drawer Test Song')).toBeVisible()
  })
})
