import { test, expect, type Page } from '@playwright/test'
import { color } from 'pengrape'

const randomColor = color({ format: 'hex' })

const loginLocators = {
  emailInput: 'input#email',
  passwordInput: 'input#password',
  signInButton: '[value="Sign In"]',
}

const landingPageLocators = {
  pagesTab: '[data-cy="nav-pages"]',
  recordsTab: '[data-cy="nav-records"]',
  editView: '[content="Click to edit this view"]',
  rulesButton: '[data-cy="Rules"]',
  liveButton: '.accessMenu_directLink',
}

const recordsPageLocators = {
  warehouseInventoryRecord: '[content="View Warehouse Inventory records"]',
  addFilterButton: '[data-cy="add-filters"]',
  filterProcessInput: '[data-cy="field-list-field"]',
  dropdownSelector: '[data-cy="dropdown-select"]',
  filtersSaveButton: '[type="submit"]',
  needsReOrderColumn: '.knTable.is-fullwidth.knTable--striped td:nth-child(13)'
}

const displayRulesLocators = {
  editView: '[content="Click to edit this view"]',
  rules: '[data-cy="list-item"]',
  colorInput: '.kn-colorInput_input',
  saveRuleButton: '[data-cy="toolbox-save"]',
  colorPicker: '.kn-colorPicker',
  chooseButton: '.sp-choose'
}

const liveViewLocators = {
  emailInput: '#email',
  passwordInput: '#password',
  signInButton: '.kn-button.is-primary',
  linksLocators: '.kn-link.kn-link-page',
  customerColumn: '[data-column-index="2"]',
  inventoryTabButton: '[data-kn-slug="#inventory2"]',
  filtersButton: '.kn-filters-nav',
  filterSelect: '.field.select',
  filterApplyButton: '#kn-submit-filters',
  reorderColumn: '.kn-table-table  td:nth-child(8)'
}

const values = {
  url: 'https://builder.knack.com/legarcia/warehouse-manager/schema/list',
  email: 'legarcia@unbosque.edu.co',
  password: 'PASSWORD_HERE',
  adminEmail: 'admin@test.com',
  adminPassword: 'PASSWOR_HERE',
  inventoryName: 'Brazil Santos - Ground (5 lb)'
}

test.beforeEach(async ({ page }) => {
  await page.goto(values.url)
  await page.locator(loginLocators.emailInput).nth(1).type(values.email)
  await page.locator(loginLocators.passwordInput).nth(1).type(values.password)
  await page.locator(loginLocators.signInButton).nth(1).click()
});

test.describe('First Test Suit', () => {

  test('Icon Color for Display Rules', async ({ page }) => {

    await page.locator(landingPageLocators.pagesTab).click()

    await page.getByText('Admin > Inventory').click()
    await page.getByText('Inventory', { exact: true }).first().click()
    await page.getByText('View Warehouse Inventory Details', { exact: true }).first().click()

    await page.locator(landingPageLocators.editView).nth(0).click()
    await page.getByText('Customer', { exact: true }).first().click({ force: true })
    const rules = await page.locator(displayRulesLocators.rules)
    const rulesCount = await rules.count()
    expect(rulesCount).toBeGreaterThan(0)

    await page.locator(displayRulesLocators.colorInput).first().clear()
    await page.locator(displayRulesLocators.colorInput).first().type(randomColor)

    await page.locator(displayRulesLocators.saveRuleButton).click({ force: true })

    const liveButton = page.locator(landingPageLocators.liveButton)
    await liveButton.evaluate((element: HTMLElement) => {
      element.removeAttribute('target')
    })

    await liveButton.click()

    await page.locator(liveViewLocators.emailInput).type(values.adminEmail)
    await page.locator(liveViewLocators.passwordInput).type(values.adminPassword)
    await page.locator(liveViewLocators.signInButton).click()

    await page.locator(liveViewLocators.inventoryTabButton).first().click()

    const searchInput = page.getByPlaceholder('search by keyword')
    await searchInput.fill(values.inventoryName)
    await searchInput.press('Enter')

    await page.locator(liveViewLocators.linksLocators).first().click()

    const columnElement = page.locator(liveViewLocators.customerColumn)

    const styleAttribute = await columnElement.getAttribute('style')
    expect(styleAttribute).toContain(randomColor)
  })
})

test.describe('Second Test Suit', () => {

  test('Filtering Inventory', async ({ page }) => {

    await page.locator(landingPageLocators.pagesTab).click()

    await page.locator(landingPageLocators.recordsTab).click()
    await page.locator(recordsPageLocators.warehouseInventoryRecord).click()

    await page.locator(recordsPageLocators.addFilterButton).click()

    const selectorInput = page.locator(recordsPageLocators.filterProcessInput)
    await selectorInput.selectOption({ label: 'Needs Re-Order' })
    const dropdownSelector = page.locator(recordsPageLocators.dropdownSelector)
    await dropdownSelector.selectOption({ value: 'true' })
    await page.locator(recordsPageLocators.filtersSaveButton).first().click({ force: true })
    await page.waitForTimeout(5000)

    const texts = await page.locator(recordsPageLocators.needsReOrderColumn).allTextContents()
    const arraySize = texts.length
    texts.forEach(element => {
      expect(element).toBe('Yes')
    })

    const liveButton = page.locator(landingPageLocators.liveButton)
    await liveButton.evaluate((element: HTMLElement) => {
      element.removeAttribute('target')
    })

    await liveButton.click()

    await page.locator(liveViewLocators.emailInput).type(values.adminEmail)
    await page.locator(liveViewLocators.passwordInput).type(values.adminPassword)
    await page.locator(liveViewLocators.signInButton).click()

    await page.locator(liveViewLocators.inventoryTabButton).first().click()

    await page.locator(liveViewLocators.filtersButton).click()

    const liveSelectorInput = page.locator(liveViewLocators.filterSelect)
    await liveSelectorInput.selectOption({ label: 'Needs Re-Order' })
    await page.locator(liveViewLocators.filterApplyButton).first().click({ force: true })
    await page.waitForTimeout(5000)

    const liveTexts = await page.locator(liveViewLocators.reorderColumn).allTextContents()
    const decodedLiveTexts = liveTexts.map(element => element.replace(/\n/g, '').trim())
    for (let i = 0; i < (decodedLiveTexts.length - 1); i++) {
      expect(decodedLiveTexts[i]).toBe('Yes')
    }

    const liveArraySize = decodedLiveTexts.length - 1

    expect(liveArraySize).toBe(arraySize)
  })
})