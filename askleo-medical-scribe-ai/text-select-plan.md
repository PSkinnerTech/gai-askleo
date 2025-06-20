# Plan: Grammarly-Style Text Selection & Suggestions

This plan outlines the steps to implement contextual suggestions on user-selected text within the editor, moving from whole-document analysis to a more precise, user-driven interaction. The core approach will leverage the `<textarea>` element's native selection properties.

---

### Phase 1: Capture User Selection

The foundation of this feature is to reliably capture the text a user has selected.

-   **Action:** In `src/pages/Editor.tsx`, create a `handleSelection` event handler.
-   **Trigger:** Attach this handler to the `<Textarea>` component's `onMouseUp` and `onKeyUp` events to support both mouse and keyboard selections.
-   **Mechanism:** Inside the handler, use `event.target.selectionStart` and `event.target.selectionEnd` to get the character offsets and the selected substring.
-   **State:** Store the selected text and its range in a new state variable (e.g., `currentSelection`).

---

### Phase 2: Implement Contextual Suggestion Popover

Instead of using the sidebar, suggestions for selected text should appear directly near the selection.

-   **Action:** Create a new, reusable component, `SuggestionPopover.tsx`.
-   **Functionality:** This component will take the selected text and its position (derived from the selection range) as props. It will display a simple "Get Suggestions" button.
-   **Positioning:** Use the captured selection range to calculate and set the popover's position, making it appear next to the highlighted text.

---

### Phase 3: Update the AI Workflow

The backend analysis needs to be adapted to handle smaller text fragments instead of the entire document.

-   **Action (Client):** When the "Get Suggestions" button in the `SuggestionPopover` is clicked, trigger the existing WebSocket connection. The message sent to the server will now contain only the *selected text fragment*.
-   **Action (Backend):** The `OpenAIService` will receive the fragment and send it to `gpt-4o-mini` for analysis. The prompt is already well-suited for this, but we will monitor its performance on fragments.
-   **Data Flow:** The suggestions returned from the API will be relative to the fragment. The client will need to adjust the suggestion ranges by adding the `selectionStart` offset to correctly highlight and replace the text in the full document.

---

### Phase 4: Display & Apply Fragment-Based Suggestions

Close the loop by showing the new suggestions and enabling the user to act on them.

-   **Action:** The suggestions received from the API will now be rendered inside the `SuggestionPopover`, not the main sidebar.
-   **Logic:** The existing `applySuggestion` logic in `Editor.tsx` will be adapted to work with the popover. It will use the adjusted suggestion ranges to replace text in the main document content.
-   **Result:** The user selects text, gets a popover, clicks a button, and sees targeted suggestions that can be applied correctly, creating a fast and intuitive editing experience.
