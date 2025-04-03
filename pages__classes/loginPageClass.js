export class My_LogInPage {

    constructor(page, url) {
        this.pom_page = page;
        this.pom_url = url === undefined? 'https://freelance-learn-automation.vercel.app/login': url;
        this.pom_username = '#email1';
        this.pom_password = "//input[@id='password1']"; // can be '#password1' too!
        this.pom_btn_signIn = "button[type='submit']";
        this.pom_manage_button ="//span[normalize-space()='Manage']";
    }

    async logIntoApp(user, password) {
        await this.pom_page.goto(this.pom_url);
        await this.pom_page.waitForLoadState();
        // await this.pom_page.fill(this.pom_username, "admin@email.com"); //old , but supported
        // await this.pom_page.fill(this.pom_password, "admin@123");
        // await this.pom_page.click(this.pom_btn_signIn);  
        if (user === undefined) {
            user = "admin@email.com"
        }
        if (password === undefined) {
            password = "admin@123"
        }
        await this.pom_page.locator(this.pom_username).fill(user); // ✅ Use locator
        await this.pom_page.locator(this.pom_password).fill(password); // ✅ Use locator
        await this.pom_page.locator(this.pom_btn_signIn).click(); // ✅ Use locator   
    }
    async getManageButton() {
        // await this.pom_page.locator(this.pom_manage_button).waitFor();
        return this.pom_page.locator(this.pom_manage_button);
    }
}
