# shopping-list
A simple, no-frills shopping list app.
## Motivation
A no-nonsense shopping list app where I can just enter things I need and check them off when I'm done with them, nothing more.
## Current Version
v0.1.3-alpha
## Dependencies
- Firebase 10.3.1
## Changelog
Visit https://github.com/sjs-code-foundry/shopping-list/releases for an updated list.
## Planned Features
### v0.1.3-alpha
#### Quality of Life (for me)
- [ ] Implement isOffline const for easy switching between live and emulator
#### Security
- [x] Implement Firebase Authentication
- [x] Fix Firebase Authentication
- [ ] Get App Check to work
#### User Experience
- [x] Ensure that when the user auto-logs back in the buttons & inputs work correctly
- [x] Implement auto-close function for drop-down menu (click anywhere other than on menu)
#### Testing
- [ ] Try to get emulators working so you can apply the fix to the Weekly Checks app
### v0.1.4-alpha
#### Aesthetics
- [ ] Fix spacing of link buttons in drop-down, sidebar and login menus
#### Code Readability
- [ ] Refactor code to get rid of unnecessary getElementById consts
#### User Experience
- [ ] Disable Add to cart button if no text is entered
- [ ] Convert all text & element sizes to em values for scalability across devices
### v0.1.5-alpha
#### User Experience
- [ ] Add ability to sort list in descending order as well as ascending
