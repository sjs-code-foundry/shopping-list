import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js"
import {    initializeAppCheck,
            ReCaptchaV3Provider
        } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app-check.js";
import {    getDatabase,
            ref,
            push,
            onValue,
            remove
        } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js"
import { connectDatabaseEmulator } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js"

// Initialize firebase - 1st code block = DB emulator; 2nd code block = online DB

// Firebase - DB Emulator
const app = initializeApp({ projectId: "playground-62567" })
const database = getDatabase(app)
if (location.hostname === "localhost") {
    connectDatabaseEmulator(database, "127.0.0.1", 9000)
}

// Firebase - Online Code
// const appSettings = {
//     databaseURL: "https://playground-62567-default-rtdb.europe-west1.firebasedatabase.app/",
//     apiKey: "AIzaSyBF39RJz9HnX_gU2aUhe31IHJz8vp7qnEM",
//     authDomain: "playground-62567.firebaseapp.com",
//     databaseURL: "https://playground-62567-default-rtdb.europe-west1.firebasedatabase.app",
//     projectId: "playground-62567",
//     storageBucket: "playground-62567.appspot.com",
//     messagingSenderId: "914430038851",
//     appId: "1:914430038851:web:a5636fcbbf19c634c715f6"
// }
// const app = initializeApp(appSettings)
// const appCheck = initializeAppCheck(app, {
//     provider: new ReCaptchaV3Provider('6LcPgswoAAAAAKP_C4cmyQ8on9HVpnEQSzfdH-0v'),
//     isTokenAutoRefreshEnabled: true
// })
// const database = getDatabase(app)



const shoppingListInDB = ref(database, "shoppingList")

// DOM Elements

const tabListBtnEl = document.getElementById("tab-list")
const tabAccountBtnEl = document.getElementById("tab-account")
const tabAboutBtnEl = document.getElementById("tab-about")

const tabListEl = document.getElementById("sect-list")
const tabAccountEl = document.getElementById("modal-account")
const tabAboutEl = document.getElementById("sect-about")
const tabElList = [tabListEl, tabAboutEl] // For tabControl function

const tabAccountCloseBtnEl = document.getElementById("modal-close")

const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")

const aboutVersionEl = document.getElementById("about-version")

// Update Firebase DB on Change

onValue(shoppingListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())
    
        clearShoppingListEl()
        
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
            let currentItemID = currentItem[0]
            let currentItemValue = currentItem[1]
            
            appendItemToShoppingListEl(currentItem)
        }    
    } else {
        shoppingListEl.innerHTML = "No items here... yet"
    }
})

// Constants/Variables

const versionNum = "v0.1.3-alpha"

// Tab Control

tabChange(tabListEl) // Set default tab

function tabChange(targetEl) {
    for (let i = 0; i < tabElList.length; i++) {
        tabElList[i].style.display = "none"
    }

    targetEl.style.display = "block"
}

// Event Listeners

tabListBtnEl.addEventListener("click", function() {
    tabChange(tabListEl)
})

tabAccountBtnEl.addEventListener("click", function() {
    tabAccountEl.style.display = "flex"
})

tabAccountCloseBtnEl.addEventListener("click", function() {
    tabAccountEl.style.display = "none"
})

tabAboutBtnEl.addEventListener("click", function() {
    tabChange(tabAboutEl)
})

addButtonEl.addEventListener("click", function() {
    let inputValue = inputFieldEl.value
    
    push(shoppingListInDB, inputValue)
    
    clearInputFieldEl()
})

// List Functions

function clearShoppingListEl() {
    shoppingListEl.innerHTML = ""
}

function clearInputFieldEl() {
    inputFieldEl.value = ""
}

function appendItemToShoppingListEl(item) {
    let itemID = item[0]
    let itemValue = item[1]
    
    let newEl = document.createElement("li")
    
    newEl.textContent = itemValue
    
    newEl.addEventListener("click", function() {
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)
        
        remove(exactLocationOfItemInDB)
    })
    
    shoppingListEl.append(newEl)
}

// About Tab Functions
versionUpdate()

function versionUpdate() {
    aboutVersionEl.textContent = `Version: ${versionNum}`
}
