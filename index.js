/* === Imports === */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
import { initializeAppCheck,
         ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";
import { getDatabase,
         ref,
         push,
         onValue,
         remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js"
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
// import { connectDatabaseEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js" // Delete
import { connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

/* === Firebase -  Initialize Firebase === */

const isOffline = false

const appSettings = getAppConfig()
const app = initializeApp(appSettings)

// const appCheck = getAppCheck() // Fix Later

const auth = getAuth(app)
// const provider = new GoogleAuthProvider() // Retain for google logins

const database = getFirestore(app)

if (isOffline && location.hostname === "localhost") {

    // connectDatabaseEmulator(database, "127.0.0.1", 9000) // Delete
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
            provider: new ReCaptchaEnterpriseProvider('6LcPgswoAAAAAKP_C4cmyQ8on9HVpnEQSzfdH-0v'),
            isTokenAutoRefreshEnabled: true
        })

    }

}

let shoppingListInDB

/* == Firebase - Database Location Ref == */

const collectionName = "shoppingList"

/* == Firebase - Update List for User == */

// onAuthStateChanged(auth, (user => {
//     if (user) {
//         footerUserstatusEl.textContent = `Signed in as: ${user.email}`

//         tabLogoutBtnEl.style.display = "block"

//         shoppingListInDB = ref(database, `${user.uid}/shoppingList`)

//         onValue(shoppingListInDB, function(snapshot) {
//             if (snapshot.exists()) {
//                 let itemsArray = Object.entries(snapshot.val())
            
//                 clearShoppingListEl()
                
//                 for (let i = 0; i < itemsArray.length; i++) {
//                     let currentItem = itemsArray[i]
//                     let currentItemID = currentItem[0]
//                     let currentItemValue = currentItem[1]
                    
//                     appendItemToShoppingListEl(currentItem)
//                 }    
//             } else {
//                 shoppingListEl.innerHTML = "No items here... yet"
//             }
//         })
//     } else {
//         shoppingListEl.innerHTML = "No items here... yet"
//     }
// }))

onAuthStateChanged(auth, (user => {
    if (user) {

        footerUserstatusEl.textContent = `Signed in as: ${user.email}`

        tabAccountBtnEl.style.display = "none"
        tabListBtnEl.style.display = "block"
        tabLogoutBtnEl.style.display = "block"

        inputLock(false)

        fetchShoppingList(user)

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
                                        orderBy("createdAt", "body"))

    fetchShoppingListInRealTimeFromDB(q, user)

}

/* === DOM Elements === */

const tabListBtnEl = document.getElementById("tab-list")
const tabAccountBtnEl = document.getElementById("tab-account")
const tabLogoutBtnEl = document.getElementById("tab-logout")
const tabAboutBtnEl = document.getElementById("tab-about")

const tabAccountEl = document.getElementById("sect-account")
const tabListEl = document.getElementById("sect-list")
const tabAboutEl = document.getElementById("sect-about")
const tabElList = [tabAccountEl, tabListEl, tabAboutEl] // For tabControl function

const tabAccountCloseBtnEl = document.getElementById("modal-close")
const tabAccountFormEl = document.getElementById("account-form")
const accountSwPrompt = document.getElementById("account-sw-prompt")
const accountSwitchBtn = document.getElementById("account-switch")

const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")

const aboutVersionEl = document.getElementById("about-version")

const footerUserstatusEl = document.getElementById("footer-userstatus")

/* === Constants/Variables === */

const versionNum = "v0.1.3-alpha"

let accountExists = true
signInOnSwitch() // Setup initial state of sign-in modal

tabListBtnEl.style.display = "none"
tabLogoutBtnEl.style.display = "none"

inputLock(true)

/* === Tab Control === */

tabChange(tabAccountEl) // Set default tab

function tabChange(targetEl) {
    for (let i = 0; i < tabElList.length; i++) {
        tabElList[i].style.display = "none"
    }

    targetEl.style.display = "block"
}

/* === Event Listeners === */

tabListBtnEl.addEventListener("click", function() {
    tabChange(tabListEl)
})

tabAccountBtnEl.addEventListener("click", function() {
    tabChange(tabAccountEl)
})

tabAboutBtnEl.addEventListener("click", function() {
    tabChange(tabAboutEl)
})

// tabAccountCloseBtnEl.addEventListener("click", function() {
//     tabAccountEl.style.display = "none"
// })

tabAccountFormEl.addEventListener("submit", function(e) {
    e.preventDefault()

    tabAccountEl.style.display = "none"

    const signInFormData = new FormData(tabAccountFormEl)

    if (accountExists) {
        
        authSignInWithEmail(signInFormData)

        tabListBtnEl.style.display = "block"

    } else {

        authCreateAccountWithEmail(signInFormData)

        tabListBtnEl.style.display = "block"

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

    authSignOut()

    tabChange(tabAccountEl)

    tabAccountBtnEl.style.display = "block"
    tabListBtnEl.style.display = "none"
    tabLogoutBtnEl.style.display = "none"
})

addButtonEl.addEventListener("click", function() {
    let inputValue = inputFieldEl.value
    
    addItemToDB(inputValue, auth.currentUser)
    
    clearInputFieldEl()
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
    } else {
        accountSwPrompt.textContent = "Got an account?"
        accountSwitchBtn.textContent = "Sign In"
        document.getElementById("modal-title").textContent = "Sign Up"
        tabAccountBtnEl.textContent = "Sign Up"
        tabAccountFormEl.reset()
    }
}

/* == Authentication == */

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
            const errorCode = error.code
            const errorMessage = error.message
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
            const errorCode = error.code
            const errorMessage = error.message
        })

}

function authSignOut() {

    signOut(auth)
        .then(function() {

            footerUserstatusEl.textContent = "Sign in to see your list."

            tabChange(tabAccountEl)

        })
        .catch((error) => {
            const errorCode = error.code
            const errorMessage = error.message
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
        inputFieldEl.disabled = true

        addButtonEl.disabled = true
        addButtonEl.style.color = "lightgray"
        addButtonEl.style.cursor = "not-allowed"
    } else {
        inputFieldEl.disabled = false

        addButtonEl.disabled = false
        addButtonEl.style.color = "#1C0F13"
        addButtonEl.style.cursor = "pointer"
    }
}

// function appendItemToShoppingListEl(item) {
//     let itemID = item[0]
//     let itemValue = item[1]
    
//     let newEl = document.createElement("li")
    
//     newEl.textContent = itemValue
    
//     newEl.addEventListener("click", function() {
//         console.log(JSON.stringify(shoppingListInDB)) // This works, need to extract without the first part of URL
//         // try logging out the database part of ref?

//         let exactLocationOfItemInDB = ref(database, `${user.uid}/shoppingList/${itemID}`) // FIX!!!
        
//         remove(exactLocationOfItemInDB) // Inoperable, 
//     })

//     // shoppingListInDB = ref(database, `${user.uid}/shoppingList`)
    
//     shoppingListEl.append(newEl)
// }

function appendItemToShoppingListEl(listEl, wholeDoc) {

    const postData = wholeDoc.data()

    let newEl = document.createElement("li")

    newEl.textContent = postData.body

    newEl.addEventListener("click", function() {

        deleteItemFromDB(wholeDoc.id)

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

        console.log("Document written with ID: ", docRef.id)

    } catch (error) {

        console.error(error.message)

    }

}

async function deleteItemFromDB(docId) {

    await deleteDoc(doc(database, collectionName, docId))

}

/* == About Tab == */

versionUpdate()

function versionUpdate() {
    aboutVersionEl.textContent = `Version: ${versionNum}`
}
