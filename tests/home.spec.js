import { test, expect } from '@playwright/test';
import utils from './utils.js';

test('flacky test checking for even number', async ( ) => {
    const intVal = utils.getRandomInt();
    console.log("checking if number "+ intVal + " is even....");
    expect (intVal%2 === 0).toBeTruthy();
});