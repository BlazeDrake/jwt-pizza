import { test, expect } from 'playwright-test-coverage';


test('basic navigation', async ({page})=>{
  await page.goto('/');
  expect(await page.title()).toBe('JWT Pizza');
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
  await expect(page.getByRole('list')).toContainText('history');
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByRole('list')).toContainText('about');
  await expect(page.getByRole('main')).toContainText('The secret sauce');
  await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('list')).toContainText('franchise-dashboard');
  await expect(page.getByRole('alert')).toContainText('If you are already a franchisee, pleaseloginusing your franchise account');

  await page.goto('/docs');
  await expect(page.getByRole('heading')).toContainText('JWT Pizza API');
})

test('unknown-page', async ({page})=>{
  await page.goto('/badpage');
  await expect(page.getByRole('heading')).toContainText('Oops');
})



