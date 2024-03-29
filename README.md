# shopping-list
A simple, no-frills shopping list app.
## Motivation
A no-nonsense shopping list app where I can just enter things I need and check them off when I'm done with them, nothing more.
## Current Version
v0.1.4-alpha
## Dependencies
- Firebase 10.8.0
## Changelog
Visit https://github.com/sjs-code-foundry/shopping-list/releases for an updated list.
## Planned Features
### v0.1.4-alpha
#### Security
- [x] Implement security rules in Firebase
#### Quality of Life (for me)
- [x] Implement isOffline const for easy switching between live and emulator
#### User Experience
- [x] Disable Add to cart button if no text is entered
- [x] Convert all text & element sizes to em values for scalability across devices
- [x] Scale elements for easier targeting across devices
- [x] Implement focus state control for drop-down menu (for vertical PC monitors)
- [x] Add focus states to the input fields
- [x] Make the list items focusable (allow impaired users to check off items)
- [x] Implement CSS Breakpoints (not needed)
- [x] Add Scroll Bar to side menu in Landscape
#### Aesthetics
- [x] Fix spacing of link buttons in drop-down, sidebar and login menus
#### Code Readability
- [x] Refactor code to get rid of unnecessary getElementById consts
### v0.1.5-alpha
#### Accessibility
- [ ] Add alt text to elements for screen readers
#### Security
- [ ] Get App Check to work
#### User Experience
- [ ] Add ability to sort list in descending order as well as ascending
- [ ] Fix issues with tab control on drop-down menu (closes on first open, doesn't close when you run out of links)
#### Testing
- [ ] Try to get emulators working so you can apply the fix to the Weekly Checks app
