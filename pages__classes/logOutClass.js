import { expect } from "playwright/test";

export class My_LogOutProfile {

    constructor(page) {
        this.pom_page = page;
        this.pom_header_text = "//h1[normalize-space()='Learn Automation Courses']";
        this.pom_menu_icon = "//img[@alt='menu']"; 
        this.pom_btn_signOut = "button[class='nav-menu-item']";
        this.pom_localStorage = '';
    }

    async checkHeader() {
        await this.pom_page.locator(this.pom_header_text).waitFor();
        return await this.pom_page.locator(this.pom_header_text).textContent();
    }

    async logOutProfile() {
        await this.pom_page.locator(this.pom_menu_icon).click(); 
        await this.pom_page.locator(this.pom_menu_icon).waitFor(); // wait's for appiarance
        await this.pom_page.locator(this.pom_btn_signOut).click();  
    }

    async addToCart() {
        await this.pom_page.getByText('Add to Cart').first().click();
    }
    
    async checkCart_numberItems(number) {
        const cartButton = this.pom_page.locator('.cartBtn');
        if (number == 0) {
            await expect (this.pom_page.locator('.count')).toBeHidden();
        } else {
            if (await cartButton.isVisible()) { // ✅ Ensure the cart button is visible
                const countLocator = this.pom_page.locator('.count');
        
                // ✅ Wait for the element to be visible before getting text
                await countLocator.waitFor({ state: 'visible' });
        
                const numberOfItems = await countLocator.innerText();
                expect(numberOfItems.toString()).toBe(number.toString()); 
                expect(numberOfItems !== undefined && numberOfItems.toString() === number.toString());
            } else {
                throw new Error("Cart button is not visible, cannot check item count");
            }
        }
    }
    
    async getValueOfLocalStorage(key) {
        this.pom_localStorage = await this.pom_page.evaluate((key) => {
            const value = localStorage.getItem(key);
            return value ? value.toString() : null; 
        }, key);
        return this.pom_localStorage;
    }
    
    async getSpecificTagFromBody(keyInBody) {
        if (!this.pom_localStorage) {
            throw new Error("Local storage value is empty. Ensure it's fetched before calling this method.");
        }
        const body = JSON.parse(this.pom_localStorage);
        return body[keyInBody];
    }
    
    async removeItem() {
        await this.pom_page.getByRole('button', { name: 'Remove from Cart' }).click()
        expect (await this.pom_page.getByRole('button', { name: 'Remove from Cart' })).toBeVisible ;
    }

}
