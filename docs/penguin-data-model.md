# Penguin data model

Collection: penguins
Document ID: the owner's Firebase Authentication UID

Each account can have one penguin.
Creation requires authentication and an existing user profile.
Players can create and read only their own penguin.
Repeated creation requests preserve the existing document.
Updates, deletion, and collection listing are currently denied.

Integration:
The character creation screen should call createPenguin() from src/services/penguinService.js after the player logs in.

Pending:
Agree on appearance options and assets, extend validation and rules, connect the character screen, and test saving and reloading.