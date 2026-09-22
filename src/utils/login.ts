export const OPEN_LOGIN_EVENT = 'global:open-login'

export const openLoginDialog = (tab: string = 'login', event?: Event) => {
  event?.preventDefault()
  window.dispatchEvent(new CustomEvent(OPEN_LOGIN_EVENT, { detail: { tab } }))
}