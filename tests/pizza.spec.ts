import { Page } from '@playwright/test';
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
  /*await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();*/
});

test('bad pizza verification', async({page})=>{
  await page.goto('/delivery');
  await expect(page.getByRole('heading')).toContainText('Here is your JWT Pizza!');
  await expect(page.getByRole('main')).toContainText('error');
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.locator('pre')).toContainText('{ "error": "invalid JWT. Looks like you have a bad pizza!" }');
})

test('updateUser', async ({ page }) => {

  //data
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  const newEmail = 'new-'+email;

  //this is updated to reflect the current state of data
  let mockEmail=email;
  let mockName="pizza diner";

  //mocks
    await page.route('*/**/api/auth', async (route)=>{
      const body=route.request().postDataJSON()
      if(route.request().method()==="POST"){
        const registerRes={
          "user": {
            "name": body.name,
            "email": body.email,
            "roles": [
              {
                "role": "diner"
              }
            ],
            "id": 532
          },
          "token": "aTestToken"
        }
        await route.fulfill({ json: registerRes });
      }
      else if(route.request().method()==="PUT"){
        const loginRes={
          "user": {
            "name": mockName,
            "email": mockEmail,
            "roles": [
              {
                "role": "diner"
              }
            ],
            "id": 532
          },
          "token": "aTestToken"
        }
        await route.fulfill({ json: loginRes });        
      }
      else if(route.request().method()==="DELETE"){
        const logoutRes={
          "message": "logout successful"
        }
        await route.fulfill({ json: logoutRes });
      }

    })

    await page.route('*/**/api/user/532', async (route)=>{

        let body=route.request().postDataJSON();

        mockName=body.name;
        mockEmail=body.email

        const updateRes={
          "user": {
            "name": mockName,
            "email": mockEmail,
            "roles": [
              {
                "role": "diner"
              }
            ],
            "id": 532
          },
          "token": "aTestToken"
        }

        route.fulfill({json: updateRes})
    })

    await page.route('*/**/api/order', async (route)=>{
      let orderRes={
       "dinerId": 532,
       "orders": [],
       "page": 1
      }

      route.fulfill({json: orderRes});
    })


  //test
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza diner');
    
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza diner');
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('textbox').nth(1).fill(newEmail);
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza dinerx');
  
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(newEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza dinerx');
});

test('listUsers', async({page})=>{
  await setupUserListTests(page);



  //ensure first page is all right
  await expect(page.getByRole('main')).toContainText('Name');
  await expect(page.getByRole('main')).toContainText('Email');
  await expect(page.getByRole('main')).toContainText('Role');
  await expect(page.getByRole('main')).toContainText('????');
  await expect(page.getByRole('main')).toContainText('a@jwt.com');
  await expect(page.getByRole('main')).toContainText('admin');

  await expect(page.getByRole('main')).toContainText('tests');
  await expect(page.getByRole('main')).toContainText('nerd@nerd.com');

  await expect(page.getByRole('main')).toContainText('hornet');
  await expect(page.getByRole('main')).toContainText('h@jwt.com');

  await expect(page.getByRole('main')).toContainText('creig');
  await expect(page.getByRole('main')).toContainText('c@jwt.com');

  await expect(page.getByRole('main')).toContainText('sherma');
  await expect(page.getByRole('main')).toContainText('nuu');
  await expect(page.getByRole('main')).toContainText('pizza diner');
  await expect(page.getByRole('main')).toContainText('pizza franchisee');
  await expect(page.getByRole('main')).toContainText('t');
  await expect(page.getByRole('main')).toContainText('rng');

  //ensure going forward works
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('main')).toContainText('lace');
  await expect(page.getByRole('main')).toContainText('buxwvsbtj4@test.com');

  //ensure going back works
  await page.getByRole('button', { name: 'Prev' }).click();
  await expect(page.getByRole('main')).toContainText('????');
});

test('deleteUsers', async({page})=>{
  await setupUserListTests(page);



  await page.getByRole('row', { name: 't t@jwt.com X' }).getByRole('button').click();
  await expect(page.getByRole('main')).toContainText('lace');
  await expect(page.getByRole('main')).toContainText('buxwvsbtj4@test.com');
})

test('testFranchises',async ({page})=>{

  let franchises=[
        {
            "id": 1139,
            "name": "00z7zm28fb",
            "admins": [
                {
                    "id": 1497,
                    "name": "en3jf45gro",
                    "email": "en3jf45gro@admin.com"
                }
            ],
            "stores": []
        },
        {
            "id": 559,
            "name": "02pen8b6ja",
            "admins": [
                {
                    "id": 621,
                    "name": "kb6v7hbzb9",
                    "email": "kb6v7hbzb9@admin.com"
                }
            ],
            "stores": []
        },
        {
            "id": 759,
            "name": "0391yibome",
            "admins": [
                {
                    "id": 868,
                    "name": "syeg9kruet",
                    "email": "syeg9kruet@admin.com"
                }
            ],
            "stores": [{
              id: 5,
              name: "halfway home",
              totalRevenue: 500
            }]
        }
      ]

  await page.route("*/**/api/franchise?page=0&limit=3&name=*", async(route)=>{
    if(route.request().method()==="GET"){
      route.fulfill({json: {franchises: franchises, more: true}})
    }
  })

  await loginAdmin(page);

  //test basic page elements
  await expect(page.getByRole('main')).toContainText('Franchise');
  await expect(page.getByRole('main')).toContainText('Franchisee');
  await expect(page.getByRole('main')).toContainText('Store');
  await expect(page.getByRole('main')).toContainText('Revenue');
  await expect(page.getByRole('main')).toContainText('Action');
  await expect(page.locator('tfoot')).toMatchAriaSnapshot(`- button "»"`);

  //test list
  await expect(page.getByRole('main')).toContainText('00z7zm28fb');
  await expect(page.getByRole('main')).toContainText('02pen8b6ja');
  await expect(page.getByRole('main')).toContainText('0391yibome');
  await expect(page.getByRole('main')).toContainText('en3jf45gro');
  await expect(page.getByRole('main')).toContainText('kb6v7hbzb9');
  await expect(page.getByRole('main')).toContainText('syeg9kruet');

  //test store display
  await expect(page.getByRole('main')).toContainText('halfway home');
  await expect(page.getByRole('main')).toContainText('500 ₿');

  //test buttons
  await page.getByRole('row', { name: '00z7zm28fb en3jf45gro Close' }).getByRole('button').click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await expect(page.getByRole('main')).toContainText('Are you sure you want to close the 00z7zm28fb franchise? This will close all associated stores and cannot be restored. All outstanding revenue will not be refunded.');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('row', { name: 'halfway home 500 ₿ Close' }).getByRole('button').click();
  await expect(page.getByRole('main')).toContainText('Are you sure you want to close the 0391yibome store halfway home ? This cannot be restored. All outstanding revenue will not be refunded.');
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('h2')).toContainText('Mama Ricci\'s kitchen');

})

async function setupUserListTests(page: Page){

  //local storage of users for test purposes
  let userList=[
      {
        "id": 1,
        "name": "????",
        "email": "a@jwt.com",
        "roles": [
          {
            "role": "admin"
          }
        ]
      },
      {
        "id": 2,
        "name": "tests",
        "email": "nerd@nerd.com",
        "roles": []
      },
      {
        "id": 3,
        "name": "hornet",
        "email": "h@jwt.com",
        "roles": []
      },
      {
        "id": 4,
        "name": "creig",
        "email": "c@jwt.com",
        "roles": [
          {
            "objectId": 1,
            "role": "franchisee"
          }
        ]
      },
      {
        "id": 5,
        "name": "sherma",
        "email": "s@jwt.com",
        "roles": []
      },
      {
        "id": 6,
        "name": "nuu",
        "email": "n@jwt.com",
        "roles": []
      },
      {
        "id": 7,
        "name": "pizza diner",
        "email": "d@jwt.com",
        "roles": []
      },
      {
        "id": 8,
        "name": "pizza franchisee",
        "email": "g@jwt.com",
        "roles": []
      },
      {
        "id": 9,
        "name": "t",
        "email": "t@jwt.com",
        "roles": []
      },
      {
        "id": 10,
        "name": "rng",
        "email": "96ho9hl8kj@test.com",
        "roles": []
      },
      {
        "id": 11,
        "name": "lace",
        "email": "buxwvsbtj4@test.com",
        "roles": []
      }
    ];


  //Mocks

  await page.route('*/**/api/user*', async (route) => {

    expect(route.request().method()).toBe('GET');

    // Get the full URL including query parameters
    const url = new URL(route.request().url());
    
    // Access specific query parameters
    const page = parseInt(url.searchParams.get('page') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const name = url.searchParams.get('name') || '*';

    let startVal=page*limit;
    let endVal=startVal+limit;

    // Create response based on query parameters
    const response = {
      users: userList.slice(startVal,endVal>userList.length?userList.length:endVal),
      more: true
    };

    await route.fulfill({ json: response });
  });

  await page.route('*/**/api/user/9', async(route)=>{
    expect(route.request().method()).toBe('DELETE');

    if(userList.length>10){
      userList = userList.filter((user)=>user.id!=9)
    }

    await route.fulfill({json: { message: 'user deleted' }})

  })

  loginAdmin(page);


}

async function loginAdmin(page: Page){
    await page.route('*/**/api/auth', async (route)=>{
    if(route.request().method()==="PUT"){
      let adminLogin={
        "user": {
          "id": 1,
          "name": "????",
          "email": "a@jwt.com",
          "roles": [
            {
              "role": "admin"
            }
          ]
        },
        "token": "aGoodToken"
      }

      route.fulfill({json: adminLogin})
    }
  })

  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('coolPassword');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
}

