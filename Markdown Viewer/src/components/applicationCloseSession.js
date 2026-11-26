/**
 * Preserve the recoverable tab session before the native window closes.
 *
 * Application close is intentionally different from document close: dirty
 * documents remain in the persisted session and are offered again on the next
 * launch, while closing an individual document still requires confirmation.
 */
export function persistSessionBeforeApplicationClose(tabManager) {
  tabManager?.persistTabs?.();
}
