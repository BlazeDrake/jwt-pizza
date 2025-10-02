import { test, expect } from 'playwright-test-coverage';

test('register-then-logout', async ({page})=>{
  await page.route('http://localhost:3000/api/auth', async (route)=>{
    if(route.request().method()==="POST"){
        const registerRes={
        "user": {
          "name": "testUser",
          "email": "test@a.com",
          "roles": [
            {
              "role": "diner"
            }
          ],
          "id": 519
        },
        "token": "aTestToken"
      }
      await route.fulfill({ json: registerRes });
    }
    else if(route.request().method()==="DELETE"){
      const logoutRes={
        "message": "logout successful"
      }
      await route.fulfill({ json: logoutRes });
    }

  })


  await page.goto('/');

  //register
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('testUser');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('test@a.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('totallySeecure');
  await page.getByRole('button', { name: 'Register' }).click();

  //ensure login is successful
  await expect(page.locator('#navbar-dark')).toContainText('Logout');
  await page.getByRole('link', { name: 't', exact: true }).click();
  await expect(page.getByRole('main')).toContainText('testUser');
  await expect(page.getByRole('main')).toContainText('test@a.com');
  await expect(page.getByRole('main')).toContainText('diner');

  //ensure logout is successful
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Login');
})