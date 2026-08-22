let activeDialogPromise = null;

export function showUnsavedChangesDialog(fileNames = []) {
  if (activeDialogPromise) return activeDialogPromise;

  activeDialogPromise = new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'unsaved-changes-overlay';

    const dialog = document.createElement('section');
    dialog.className = 'unsaved-changes-dialog';
    dialog.setAttribute('role', 'alertdialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'unsaved-dialog-title');
    dialog.setAttribute('aria-describedby', 'unsaved-dialog-message');

    const title = document.createElement('h2');
    title.id = 'unsaved-dialog-title';
    title.textContent = 'Unsaved changes';

    const message = document.createElement('p');
    message.id = 'unsaved-dialog-message';
    const names = fileNames.filter(Boolean);
    message.textContent = names.length === 1
      ? `“${names[0]}” has unsaved changes.`
      : `${names.length || 'Some'} documents have unsaved changes.`;

    const guidance = document.createElement('p');
    guidance.className = 'unsaved-changes-guidance';
    guidance.textContent = 'Return to the document if you want to save your changes before closing.';

    const actions = document.createElement('div');
    actions.className = 'unsaved-changes-actions';

    const discardButton = document.createElement('button');
    discardButton.type = 'button';
    discardButton.className = 'unsaved-discard-btn';
    discardButton.textContent = 'Close without saving';

    const returnButton = document.createElement('button');
    returnButton.type = 'button';
    returnButton.className = 'unsaved-return-btn';
    returnButton.textContent = names.length > 1 ? 'Return to documents' : 'Return to document';

    const finish = (shouldClose) => {
      document.removeEventListener('keydown', handleKeydown, true);
      overlay.remove();
      activeDialogPromise = null;
      resolve(shouldClose);
    };

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish(false);
      }
    };

    discardButton.addEventListener('click', () => finish(true));
    returnButton.addEventListener('click', () => finish(false));
    document.addEventListener('keydown', handleKeydown, true);

    actions.append(discardButton, returnButton);
    dialog.append(title, message, guidance, actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    returnButton.focus();
  });

  return activeDialogPromise;
}
