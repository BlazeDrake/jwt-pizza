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
  await expect(page.getByRole('main')).toContainText('JWT Pizza API');
  
})

test('unknown-page', async ({page})=>{
  await page.goto('/badpage');
  await expect(page.getByRole('heading')).toContainText('Oops');
})

test('test franchise controls', async ({ page }) => {

  //mocks
  let stores=[
      {
        id: 1,
        name: "SLC",
        totalRevenue: 0.0263
      }
    ]

  await page.route('*/**/api/auth', async (route)=>{
    const loginRes={
      user: {
        id: 4,
        name: "pizza franchisee",
        email: "f@jwt.com",
        roles: [
          {
            objectId: 1,
            role: "franchisee"
          }
        ]
      },
      token: "abc123"
    }
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({json: loginRes})
  })

  await page.route('*/**/api/franchise/4', async (route)=>{

    let franchiseRes=[{
      id: 1,
      name: "pizzaPocket",
      admins: [
        {
          id: 4,
          name: "pizza franchisee",
          email: "f@jwt.com"
        }
      ],
      stores: stores
    }]

    expect(route.request().method()).toBe('GET');
    await route.fulfill({json: franchiseRes});
  })

  await page.route('*/**/api/franchise/1/store', async (route)=>{
    let newStore={
      id: stores.length+1,
      name: route.request().postDataJSON().name,
    }
    stores.push({...newStore, totalRevenue: 0});
    expect(route.request().method()).toBe("POST");
    await route.fulfill({json: {...newStore, franchiseId: 1}})
  })

  await page.route('*/**/api/franchise/1/store/*', async(route)=>{
        //get the id parameter
    let urlParams=route.request().url().split('/');
    let idToDelete = parseInt(urlParams[urlParams.length-1]);
    
    stores = stores.filter((value)=>value.id!=idToDelete)
    let deleteRes={
      "message": "store deleted"
    }
    expect(route.request().method()).toBe("DELETE");
    await route.fulfill({json: deleteRes})
  })

  //test
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('button', { name: 'Login' }).click();
    //make sure login is completed
    await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');

    //go to franchise page
    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByRole('main')).toMatchAriaSnapshot(`
      - heading "pizzaPocket" [level=2]
      - text: Everything you need to run an JWT Pizza franchise. Your gateway to success.
      - table:
        - rowgroup:
          - row "Name Revenue Action":
            - columnheader "Name"
            - columnheader "Revenue"
            - columnheader "Action"
        - rowgroup:
          - row /SLC \\d+\\.\\d+ ₿ Close/:
            - cell "SLC"
            - cell /\\d+\\.\\d+ ₿/
            - cell "Close":
              - button "Close":
                - img
      - button "Create store"
      `);

    await page.getByRole('button', { name: 'Create store' }).click();
    await page.getByRole('textbox', { name: 'store name' }).click();
    await page.getByRole('textbox', { name: 'store name' }).fill('test');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('main')).toMatchAriaSnapshot(`
      - heading "pizzaPocket" [level=2]
      - text: Everything you need to run an JWT Pizza franchise. Your gateway to success.
      - table:
        - rowgroup:
          - row "Name Revenue Action":
            - columnheader "Name"
            - columnheader "Revenue"
            - columnheader "Action"
        - rowgroup:
          - row /SLC \\d+\\.\\d+ ₿ Close/:
            - cell "SLC"
            - cell /\\d+\\.\\d+ ₿/
            - cell "Close":
              - button "Close":
                - img
          - row "test 0 ₿ Close":
            - cell "test"
            - cell "0 ₿"
            - cell "Close":
              - button "Close":
                - img
      - button "Create store"
      `);
    await page.getByRole('row', { name: 'test 0 ₿ Close' }).getByRole('button').click();
    await expect(page.getByRole('main')).toContainText('Are you sure you want to close the pizzaPocket store test ? This cannot be restored. All outstanding revenue will not be refunded.');
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('main')).toMatchAriaSnapshot(`
      - heading "pizzaPocket" [level=2]
      - text: Everything you need to run an JWT Pizza franchise. Your gateway to success.
      - table:
        - rowgroup:
          - row "Name Revenue Action":
            - columnheader "Name"
            - columnheader "Revenue"
            - columnheader "Action"
        - rowgroup:
          - row /SLC \\d+\\.\\d+ ₿ Close/:
            - cell "SLC"
            - cell /\\d+\\.\\d+ ₿/
            - cell "Close":
              - button "Close":
                - img
      - button "Create store"
      `);
});

test('register-then-logout', async ({page})=>{
  await page.route('*/**/api/auth', async (route)=>{
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

test('purchase with login', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route('*/**/api/franchise?page=0&limit=20&name=*', async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: 'LotaPizza',
        stores: [
          { id: 4, name: 'Lehi' },
          { id: 5, name: 'Springville' },
          { id: 6, name: 'American Fork' },
        ],
      },
      { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      { id: 4, name: 'topSpot', stores: [] },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: {franchises: franchiseRes }});
  });

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = {
      user: {
        id: 3,
        name: 'Kai Chen',
        email: 'd@jwt.com',
        roles: [{ role: 'diner' }],
      },
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');



  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Wait for page load
  await page.waitForSelector('h2:has-text("Awesome is a click away")');

  // Wait for combobox to be ready
  await page.waitForSelector('select:not([disabled])');

  //order pizza
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  //login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test('bad pizza verification', async({page})=>{
  await page.goto('/delivery');
  await expect(page.getByRole('heading')).toContainText('Here is your JWT Pizza!');
  await expect(page.getByRole('main')).toContainText('error');
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.locator('pre')).toContainText('{ "error": "invalid JWT. Looks like you have a bad pizza!" }');
})



