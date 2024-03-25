/* === Imports === */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
import { initializeAppCheck,
         ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";
import { getAuth,
         onAuthStateChanged,
         createUserWithEmailAndPassword,
         signInWithEmailAndPassword,
         GoogleAuthProvider,
         signInWithPopup,
         signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"
import { getFirestore,
         collection,
         addDoc,
         serverTimestamp,
         onSnapshot,
         query,
         where,
         orderBy,
         doc,
         deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

import { connectAuthEmulator }  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"
import { connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

/* === Firebase -  Initialize Firebase === */

const isOffline = false

const appSettings = getAppConfig()
const app = initializeApp(appSettings)

// const appCheck = getAppCheck() // Get this working!!!

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

const database = getFirestore(app)

if (isOffline && location.hostname === "localhost") {

    connectAuthEmulator(auth, "http://127.0.0.1:9099")
    connectFirestoreEmulator(database, '127.0.0.1', 8080) // Not known if functioning correctly

}

function getAppConfig() {

    if (isOffline) {

        return { 
                    projectId: "shopping-list-94f50",
                    apiKey: "test-api-key",
                    authDomain: "test",
                    appId: "test"
                }

    } else {

        return {
                    apiKey: "AIzaSyCuR9uK0W0DXuahvbbBCzn4ITXuIKh9Mbs",
                    authDomain: "shopping-list-94f50.firebaseapp.com",
                    projectId: "shopping-list-94f50",
                    storageBucket: "shopping-list-94f50.appspot.com",
                    messagingSenderId: "209544764408",
                    appId: "1:209544764408:web:751d9c64ee3f47e1f8d40d"
                }

    }

}

function getAppCheck() {

    if (isOffline) {

        // AppCheck not needed

    } else {

        return initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider("6LcPgswoAAAAAKP_C4cmyQ8on9HVpnEQSzfdH-0v"),
            isTokenAutoRefreshEnabled: true
        })

    }

}

let shoppingListInDB

/* == Firebase - Database Location Ref == */

const collectionName = "shoppingList"

/* == Firebase - Update List for User == */

onAuthStateChanged(auth, (user => {

    if (user) {

        footerUserstatusEl.textContent = `Signed in as: ${user.email}`

        tabAccountBtnEl.style.display = "none"
        tabListBtnEl.style.display = "block"
        tabLogoutBtnEl.style.display = "block"

        inputLock(false)

        fetchShoppingList(user)

        lockAddButton(true)

    } else {

        inputLock(true)

        shoppingListEl.innerHTML = "No items here... yet"

    }

}))

function fetchShoppingListInRealTimeFromDB(query, user) {

    onSnapshot(query, (querySnapshot) => {

        clearShoppingListEl()

        querySnapshot.forEach((doc) => {

            appendItemToShoppingListEl(shoppingListEl, doc)

        })

    })

}

function fetchShoppingList(user) {

    const shoppingListRef = collection(database, collectionName)

    const q = query(shoppingListRef,    where("uid", "==", user.uid),
                                        orderBy("body", "asc"))

    fetchShoppingListInRealTimeFromDB(q, user)

}

/* === DOM Elements === */

const menuIconEl = document.getElementById("menu-icon")
const tabListBtnEl = document.getElementById("tab-list")
const tabAccountBtnEl = document.getElementById("tab-account")
const tabLogoutBtnEl = document.getElementById("tab-logout")
const tabAboutBtnEl = document.getElementById("tab-about")

const headerMenuBtn = document.getElementById("menu-btn")

const tabAccountEl = document.getElementById("sect-account")
const tabListEl = document.getElementById("sect-list")
const tabAboutEl = document.getElementById("sect-about")
const tabElList = [tabAccountEl, tabListEl, tabAboutEl] // For tabControl function

const tabAccountFormEl = document.getElementById("account-form")
const accountSwPrompt = document.getElementById("account-sw-prompt")
const accountLoginGoogleBtn = document.getElementById("account-login-google")
const accountSwitchBtn = document.getElementById("account-switch")

const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")

const modalAlertEl = document.getElementById("modal-alert")
const modalAlertCloseBtn = document.getElementById("modal-alert-close")

const footerUserstatusEl = document.getElementById("footer-userstatus")

/* === Constants/Variables === */

const versionNum = "v0.1.5-alpha"

let accountExists = true
signInOnSwitch() // Setup initial state of sign-in modal

tabListBtnEl.style.display = "none"
tabLogoutBtnEl.style.display = "none"

inputLock(true)

/* === Tab Control === */

tabChange(tabElList[1]) // Set default tab to tabListEl

function tabChange(targetEl) {

    for (let i = 0; i < tabElList.length; i++) {
        tabElList[i].style.display = "none"
    }

    targetEl.style.display = "block"

}

/* === Event Listeners === */

document.addEventListener("click", function(e) {

    if (!e.target.closest("#header-area")) {

        headerMenuBtn.checked = false

    } else if (e.target.nodeName === "BUTTON") {

        headerMenuBtn.checked = false

    }

    // Refactor above with or statement in if

})

menuIconEl.addEventListener("focus", function() {
    
    headerMenuBtn.checked = true

})

tabListBtnEl.addEventListener("click", function() {

    tabChange(tabListEl)

})

tabAccountBtnEl.addEventListener("click", function() {

    tabChange(tabAccountEl)

})

tabAboutBtnEl.addEventListener("click", function() {

    tabChange(tabAboutEl)

})

tabAccountFormEl.addEventListener("submit", function(e) {

    e.preventDefault()

    tabAccountEl.style.display = "none"

    const signInFormData = new FormData(tabAccountFormEl)

    if (accountExists) {
        
        authSignInWithEmail(signInFormData)

    } else {

        authCreateAccountWithEmail(signInFormData)

    }

    tabListBtnEl.style.display = "block"

})

accountLoginGoogleBtn.addEventListener("click", function() {

    authSignInWithGoogle()

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

    authSignOut()

    tabChange(tabAccountEl)

    tabAccountBtnEl.style.display = "block"
    tabListBtnEl.style.display = "none"
    tabLogoutBtnEl.style.display = "none"

})

inputFieldEl.addEventListener("input", function() {

    lockAddButton(false)

})

inputFieldEl.addEventListener("keypress", function(e) {

    if (e.key === "Enter") {

        let inputValue = inputFieldEl.value
    
        addItemToDB(inputValue, auth.currentUser)
        
        clearInputFieldEl()

        lockAddButton(true)

    }

})

addButtonEl.addEventListener("click", function() {

    let inputValue = inputFieldEl.value
    
    addItemToDB(inputValue, auth.currentUser)
    
    clearInputFieldEl()

    lockAddButton(true)

})

// Refactor code for two event listeners above into a function?

modalAlertCloseBtn.addEventListener("click", function() {

    modalAlertEl.style.display = "none"

})

/* === Functions === */

/* == Account Form == */

function signInOnSwitch() {

    if (accountExists) {

        accountSwPrompt.textContent = "No account?"
        accountSwitchBtn.textContent = "Sign Up"
        document.getElementById("modal-title").textContent = "Sign In"
        tabAccountBtnEl.textContent = "Sign In"
        tabAccountFormEl.reset()

        accountLoginGoogleBtn.style.display = "inline-block"

    } else {

        accountSwPrompt.textContent = "Got an account?"
        accountSwitchBtn.textContent = "Sign In"
        document.getElementById("modal-title").textContent = "Sign Up"
        tabAccountBtnEl.textContent = "Sign Up"
        tabAccountFormEl.reset()

        accountLoginGoogleBtn.style.display = "none"

    }

}

/* == Authentication == */

function authSignInWithGoogle() {

    signInWithPopup(auth, provider)
        .then((result) => {

            // Signed In

            tabChange(tabListEl)

        }).catch((error) => {

            modalAlert("Sign in with Google failed!", error.message)

        })

}

function authSignInWithEmail(formData) {

    const email = formData.get('email')
    const password = formData.get('password')

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed In
            const user = userCredential.user

            tabAccountBtnEl.style.display = "none"
            tabLogoutBtnEl.style.display = "block"
            tabAccountFormEl.reset()

            tabChange(tabListEl)
            // ...
        })
        .catch((error) => {

            if (error.code === "auth/invalid-credential") {

                const errorMessage = `              
                Login denied because your email address or password were
                 incorrectly entered.  Correct your mistake and try again.
                `

                modalAlert("Wrong username or password!", errorMessage)

            } else {

                modalAlert(`Sign In Error Code: ${error.code}`, error.message)

                tabAccountFormEl.reset()

            }

        })

}

function authCreateAccountWithEmail(formData) {

    const email = formData.get('email')
    const password = formData.get('password')

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed Up
            const user = userCredential.user

            tabAccountBtnEl.style.display = "none"
            tabLogoutBtnEl.style.display = "block"
            tabAccountFormEl.reset()

            tabChange(tabListEl)
            // ...
        })
        .catch((error) => {

            modalAlert(`Create Account Error Code: ${error.code}`, error.message)

            tabAccountFormEl.reset()

        })

}

function authSignOut() {

    signOut(auth)
        .then(function() {

            footerUserstatusEl.textContent = "Sign in to see your list."

            tabChange(tabAccountEl)

        })
        .catch((error) => {

            modalAlert(`Sign Out Error Code: ${error.code}`, error.message)

        })

}

/* == List == */

function clearShoppingListEl() {
    shoppingListEl.innerHTML = ""
}

function clearInputFieldEl() {
    inputFieldEl.value = ""
}

function inputLock(state) {

    if (state) {

        lockInputField(true)

        lockAddButton(true)

    } else {

        lockInputField(false)

        lockAddButton(false)

    }

}

function lockInputField(state) {

    if (state) {

        inputFieldEl.disabled = true

    } else {

        inputFieldEl.disabled = false

    }

}

function lockAddButton(state) {

    if (state) {

        addButtonEl.disabled = true
        addButtonEl.style.color = "lightgray"
        addButtonEl.style.cursor = "not-allowed"

    } else {

        addButtonEl.disabled = false
        addButtonEl.style.color = "#1C0F13"
        addButtonEl.style.cursor = "pointer"

    }

}

function appendItemToShoppingListEl(listEl, wholeDoc) {

    const postData = wholeDoc.data()

    let newEl = document.createElement("li")

    newEl.setAttribute("tabindex", "0") // Makes list item focusable

    newEl.textContent = postData.body

    newEl.addEventListener("click", function() {

        deleteItemFromDB(wholeDoc.id)

    })

    newEl.addEventListener("keydown", function(e) {

        if (e.key === "Enter") {

            deleteItemFromDB(wholeDoc.id)
            
        }

    })

    shoppingListEl.append(newEl)

}

/* = Firestore = */

async function addItemToDB(itemBody, user) {

    try {

        const docRef = await addDoc(collection(database, collectionName), {
            body: itemBody,
            uid: user.uid,
            createdAt: serverTimestamp(),
        })

    } catch (error) {

        modalAlert("Adding item to Database failed!", error.message)

    }

}

async function deleteItemFromDB(docId) {

    await deleteDoc(doc(database, collectionName, docId))

}

/* == Alert Modal == */

function modalAlert(heading, content) {

    document.getElementById("modal-alert-header").textContent = heading
    document.getElementById("modal-alert-body").textContent = content

    modalAlertEl.style.display = "block"

}

/* == About Tab == */

versionUpdate()

function versionUpdate() {
    document.getElementById("about-version").textContent = `Version: ${versionNum}`
}
