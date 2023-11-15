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
import {    getAuth,
            connectAuthEmulator,
            onAuthStateChanged,
            createUserWithEmailAndPassword,
            signInWithEmailAndPassword,
            signOut
            } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js"
import { connectDatabaseEmulator } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js"

// Initialize firebase - 1st code block = DB emulator; 2nd code block = online DB

// Firebase - DB Emulator
const appSettings = { 
    projectId: "playground-62567",
    apiKey: "test-api-key" }
const app = initializeApp(appSettings)
const database = getDatabase(app)
const auth = getAuth(app)
if (location.hostname === "localhost") {
    connectDatabaseEmulator(database, "127.0.0.1", 9000)
    connectAuthEmulator(auth, "http://127.0.0.1:9099")
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
// const auth = getAuth(app)


let shoppingListInDB

onAuthStateChanged(auth, (user => {
    if (user) {
        footerUserstatusEl.textContent = `Signed in as: ${user.email}`

        tabLogoutBtnEl.style.display = "block"

        shoppingListInDB = ref(database, `${user.uid}/shoppingList`)

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
    } else {
        shoppingListEl.innerHTML = "No items here... yet"
    }
}))

// const shoppingListInDB = ref(database, "shoppingList")

// DOM Elements

const tabListBtnEl = document.getElementById("tab-list")
const tabAccountBtnEl = document.getElementById("tab-account")
const tabLogoutBtnEl = document.getElementById("tab-logout")
const tabAboutBtnEl = document.getElementById("tab-about")

const tabListEl = document.getElementById("sect-list")
const tabAccountEl = document.getElementById("modal-account")
const tabAboutEl = document.getElementById("sect-about")
const tabElList = [tabListEl, tabAboutEl] // For tabControl function

const tabAccountCloseBtnEl = document.getElementById("modal-close")
const tabAccountFormEl = document.getElementById("account-form")
const accountSwPrompt = document.getElementById("account-sw-prompt")
const accountSwitchBtn = document.getElementById("account-switch")

const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")

const aboutVersionEl = document.getElementById("about-version")

const footerUserstatusEl = document.getElementById("footer-userstatus")

// Update Firebase DB on Change

// onValue(shoppingListInDB, function(snapshot) {
//     if (snapshot.exists()) {
//         let itemsArray = Object.entries(snapshot.val())
    
//         clearShoppingListEl()
        
//         for (let i = 0; i < itemsArray.length; i++) {
//             let currentItem = itemsArray[i]
//             let currentItemID = currentItem[0]
//             let currentItemValue = currentItem[1]
            
//             appendItemToShoppingListEl(currentItem)
//         }    
//     } else {
//         shoppingListEl.innerHTML = "No items here... yet"
//     }
// })

// Constants/Variables

const versionNum = "v0.1.3-alpha"

let accountExists = true
signInOnSwitch()

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

tabAccountFormEl.addEventListener("submit", function(e) {
    e.preventDefault()

    tabAccountEl.style.display = "none"

    const signInFormData = new FormData(signInFormEl)


    if (accountExists) {
        signInWithEmailAndPassword(auth, signInFormData.get('email'), signInFormData.get('password'))
            .then((userCredential) => {
                // Signed In
                const user = userCredential.user
                // ...
            })
            .catch((error) => {
                const errorCode = error.code
                const errorMessage = error.message
            })

            tabAccountBtnEl.style.display = "none"
    } else {
        // Sign Up
    }
        
})

accountSwitchBtn.addEventListener("click", function() {
    if (accountExists) {
        accountExists = false
        signInOnSwitch()
    } else {
        accountExists = true
        signInOnSwitch()
    }
})

tabLogoutBtnEl.addEventListener("click", function() {
    auth.signOut()
        .then(function() {

            footerUserstatusEl.textContent = "Sign in to see your list."

        })
        .catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message
        })

        tabAccountBtnEl.style.display = "block"
})

tabAboutBtnEl.addEventListener("click", function() {
    tabChange(tabAboutEl)
})

addButtonEl.addEventListener("click", function() {
    let inputValue = inputFieldEl.value
    
    push(shoppingListInDB, inputValue)
    
    clearInputFieldEl()
})

// Account Form Functions

function signInOnSwitch() {
    if (accountExists) {
        accountSwPrompt.textContent = "No account?"
        accountSwitchBtn.textContent = "Sign Up"
        document.getElementById("modal-title").textContent = "Sign In"
        tabAccountBtnEl.textContent = "Sign In"
    } else {
        accountSwPrompt.textContent = "Got an account?"
        accountSwitchBtn.textContent = "Sign In"
        document.getElementById("modal-title").textContent = "Sign Up"
        tabAccountBtnEl.textContent = "Sign Up"
    }
}

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
